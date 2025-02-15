from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  
OpenAI.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()
class ProcessText(BaseModel):
    title: str
    setting: str
    characters: str
    point1: str
    point2: str
    point3: str

def process_text(transcription: str):
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": "You will be given an unstructured transcription of someone's memory. You will need to organize this information to extract key information and generate three bullet points."},
            {"role": "user", "content": transcription}
        ],
        response_format=ProcessText
    )
    return completion.choices[0].message.parsed

print(process_text("when i was a kid i went to legoland and i had a great time. i went on all the rides and ate a lot of ice cream. i remember the roller coaster being really fast and i was scared at first but then i loved it. i also remember the pirate ship ride being really fun and i went on it twice. i had a great time at legoland with my family - my mom, dad, and little brother george."))