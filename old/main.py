from fastapi import FastAPI, UploadFile, File
from transcribe import transcribe_audio

app = FastAPI()

@app.get("/")
def home():
    return {"message": "API is running"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    return await transcribe_audio(file)
