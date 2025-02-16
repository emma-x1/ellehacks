"""
Transcribes audio recordings and processes the text into topic-grouped conversations.
Uses MLX Whisper for transcription and LLaMA for topic extraction.
"""

import glob

# import json
import os
import datetime

import mlx_whisper
from dotenv import load_dotenv

from database import Database

# from ollama import chat
# from ollama import ChatResponse

load_dotenv(override=True)


db = Database()

recordings_dir = os.path.join("recordings", "*")

transcribed = {}

while True:
    files = sorted(glob.iglob(recordings_dir), key=os.path.getctime, reverse=True)
    if len(files) < 1:
        continue

    latest_recording = files[0]
    latest_recording_filename = latest_recording.split("/")[1]

    if os.path.exists(latest_recording) and not latest_recording in transcribed:
        # result = mlx_whisper.transcribe(
        #     latest_recording,
        #     path_or_hf_repo="mlx-community/whisper-turbo"
        # )
        result = mlx_whisper.transcribe(
            latest_recording, path_or_hf_repo="mlx-community/whisper-small.en-mlx"
        )

        text = result["text"]

        print(text)

        os.remove(latest_recording)

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H-%M-%S")

        new_transcription = {"text": text, "timestamp": timestamp}

        db.create_transcription(new_transcription)


#         print("<transcribe>\n", text, "\n</transcribe>")

#         response: ChatResponse = chat(
#             model="llama3.2",
#             messages=[
#                 {
#                     "role": "user",
#                     "content": f"""
# You are an expert text processor. The following text contains multiple conversations on different topics.
# Please extract and group sentences that belong to the same topic:
# <text>
# {text}
# </text>

# Return the response as a structured JSON format where each topic has its own array of sentences.
# Do not include any other text in the response. Only the a object a "topics" field that contains an array of sentences.
# <json>
# {{
#     "topics": [
#         {{
#             "topic": "topic",
#             "sentences": ["sentence1", "sentence2", "sentence3"]
#         }},
#         {{
#             "topic": "topic2",
#             "sentences": ["sentence4", "sentence5", "sentence6"]
#         }}
#     ]
# }}
# </json>
# """,
#                 },
#             ],
#         )

#         # print("<response>\n", response["message"]["content"], "\n</response>")

#         try:
#             json_response = json.loads(response["message"]["content"])
#         except json.JSONDecodeError:
#             try:
#                 json_response = json.loads(
#                     response["message"]["content"].split("```")[1]
#                 )
#             except json.JSONDecodeError:
#                 try:
#                     json_response = json.loads(
#                         response["message"]["content"]
#                         .split("```json")[1]
#                         .split("```")[0]
#                     )
#                 except json.JSONDecodeError:
#                     # print("<error>\n", response["message"]["content"], "\n</error>")
#                     continue
#             except (IndexError, KeyError, TypeError) as e:
#                 # print("<error>\n", response["message"]["content"], "\n</error>")
#                 continue

#         print(json_response)

#         # with open("", 'a') as f:
#         #     f.write(result.text)

#         # end = datetime.datetime.now()
#         # print(f"Transcription took {end - start}")

# os.remove(latest_recording)
#         # transcribed.add(latest_recording)

#         try:
#             for topic_group in json_response["topics"]:
#                 topic = topic_group["topic"]
#                 sentences = topic_group["sentences"]
#                 transcribed.setdefault(topic, []).extend(sentences)
#         except (IndexError, KeyError, TypeError) as e:
#             continue
