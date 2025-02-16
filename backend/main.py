"""
Main file for the application.
"""

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import Database
from memory_manager import MemoryManager
from dalle import DalleImage
from datetime import datetime

load_dotenv(override=True)

manager = MemoryManager()
scheduler = AsyncIOScheduler()
db = Database()
dalle = DalleImage()

def process_memory_images():
    """Process memories that don't have images yet"""
    # print("\n=== Starting Image Generation Process ===")
    memories = db.get_memories()
    if not memories:
        print("No memories to process")
        return

    for memory_id, memory_data in memories.items():
        try:
            # skip if memory already has an image
            if memory_data.get('image_url'):
                continue

            # skip if no dalle prompt
            if not memory_data.get('dalle_prompt'):
                continue

            # print(f"\nProcessing memory: {memory_id}")
            # print(f"DALL-E prompt: {memory_data.get('dalle_prompt')}")

            # generate dalle
            dalle_url, error = dalle.generate_memory_image(memory_data)
            if error:
                print(f"Error generating DALL-E image for memory {memory_id}: {error}")
                continue

            if not dalle_url:
                print(f"No DALL-E URL generated for memory {memory_id}")
                continue

            print(f"Generated DALL-E image: {dalle_url}")

            # upload to uploadthing
            # print("Uploading to Uploadthing...")
            upload_url = db.upload_image(dalle_url)
            if not upload_url:
                print(f"Failed to upload image for memory {memory_id}")
                continue

            # update memory field
            memory_data['image_url'] = upload_url
            db.update_memory(memory_id, memory_data)
            # print(f"Successfully added image to memory {memory_id}")
            # print(f"Image URL: {upload_url}")
        # pylint: disable=broad-except
        except Exception as e:
            print(f"Error processing memory {memory_id}: {str(e)}")
            continue

    # print("=== Image Generation Process Complete ===\n")

@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifecycle manager for the FastAPI app"""
    # run once to startup, remove later
    manager.process_transcriptions()
    scheduler.add_job(manager.process_transcriptions, "interval", seconds=60, max_instances=1)
    # schedule image generation (every 5 seconds)
    scheduler.add_job(process_memory_images, "interval", seconds=5, max_instances=1)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def home():
    """Home page"""
    return {"message": "API is running"}

@app.get("/memories")
def get_memories():
    """Get all memories"""
    memories = db.get_memories()
    if memories:
        memory_list = [{"id": k, **v} for k, v in memories.items()]
        memory_list.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return memory_list
    return []

@app.get("/memories/today")
def get_today_memories():
    """Get all memories from today"""
    memories = db.get_memories()
    today_memories = {k: v for k, v in memories.items() if v.get("timestamp").date() == datetime.now().date()}
    return today_memories

@app.get("/memory/{memory_id}")
def get_memory(memory_id: str):
    """Get a specific memory"""
    return db.get_memory(memory_id)

@app.post("/generate-images")
def generate_images():
    """Manually trigger image generation for memories"""
    process_memory_images()
    return {"message": "Image generation process completed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
