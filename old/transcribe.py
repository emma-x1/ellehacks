import whisper
import tempfile
import os
from fastapi import UploadFile

model = whisper.load_model("base")

async def transcribe_audio(file: UploadFile):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(await file.read())
        temp_audio_path = temp_audio.name

    result = model.transcribe(temp_audio_path)
    os.remove(temp_audio_path)

    return {"text": result["text"]}