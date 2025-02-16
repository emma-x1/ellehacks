"""
Database class for the application.
"""

import os
import time
import json
import http.client

import requests
from firebase_admin import db
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

from requests_toolbelt import MultipartEncoder

load_dotenv()

cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH"))
firebase_admin.initialize_app(
    cred,
    {
        "databaseURL": os.getenv("FIREBASE_DATABASE_URL"),
    },
)

print("Database url:", os.getenv("FIREBASE_DATABASE_URL"))


class Database:
    """
    Database class for the application.
    """

    def __init__(self):
        self.transcriptions_ref = db.reference("transcriptions/")
        self.memories_ref = db.reference("memories/")
        self.uploadthing_token = os.getenv("UPLOADTHING_TOKEN")

    def upload_image(self, image_url: str) -> str:
        """
        Upload an image to Uploadthing and return its public URL.
        """
        try:
            # print(f"\nDownloading image from: {image_url}")

            response = requests.get(image_url, timeout=30)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "image/jpeg")
            content_length = len(response.content)
            # print(f"Downloaded image: {content_length} bytes, type: {content_type}")

            conn = http.client.HTTPSConnection("api.uploadthing.com")

            payload = {
                "files": [
                    {
                        "name": f"memory_image_{int(time.time())}.jpg",
                        "size": content_length,
                        "type": content_type,
                        "customId": None,
                    }
                ],
                "acl": "public-read",
                "metadata": None,
                "contentDisposition": "inline",
            }
            # print("\nUploadthing payload:")
            # print(json.dumps(payload, indent=2))

            headers = {
                "X-Uploadthing-Api-Key": self.uploadthing_token,
                "Content-Type": "application/json",
            }
            # print("\nRequest headers:")
            # print(
            #     json.dumps(
            #         {
            #             k: v if k != "X-Uploadthing-Api-Key" else "[REDACTED]"
            #             for k, v in headers.items()
            #         },
            #         indent=2,
            #     )
            # )

            # Get presigned URL and fields
            # print("\nRequesting presigned URL...")
            conn.request("POST", "/v6/uploadFiles", json.dumps(payload), headers)
            res = conn.getresponse()
            # print(f"Response status: {res.status} {res.reason}")

            response_data = res.read()
            # print("Raw response:")
            # print(response_data.decode("utf-8"))

            data = json.loads(response_data.decode("utf-8"))
            # print("\nParsed response:")
            # print(json.dumps(data, indent=2))

            if not data.get("data") or not data["data"][0].get("url"):
                raise ValueError("No presigned URL in response")

            upload_data = data["data"][0]
            upload_url = upload_data.get("url")
            fields = upload_data.get("fields", {})

            # print(f"\nUploading file to presigned URL: {upload_url}")
            # print("Upload fields:")
            # print(json.dumps(fields, indent=2))

            form_data = {
                **fields,
                "file": ("image.jpg", response.content, content_type),
            }

            m = MultipartEncoder(fields=form_data)
            upload_headers = {"Content-Type": m.content_type}

            # print("Upload headers:")
            # print(json.dumps(upload_headers, indent=2))

            # Upload to S3
            upload_response = requests.post(upload_url, data=m, headers=upload_headers, timeout=30)
            # print(
            #     f"Upload response status: {upload_response.status_code} {upload_response.reason}"
            # )
            # print("Upload response body:")
            # print(upload_response.text)

            upload_response.raise_for_status()

            # Get the final URL
            file_url = upload_data.get("fileUrl")
            print(f"\nFinal file URL: {file_url}")
            return file_url
        # pylint: disable=broad-except
        except Exception as e:
            print("Error uploading image:")
            print(f"Type: {type(e).__name__}")
            print(f"Message: {str(e)}")
            if hasattr(e, "response"):
                print(f"Response status: {e.response.status_code}")
                print("Response headers:")
                print(json.dumps(dict(e.response.headers), indent=2))
                print("Response body:")
                print(e.response.text)
            return None

    def get_transcriptions(
        self, start_time: str | None = None, end_time: str | None = None
    ):
        """
        Get the transcriptions from the database.
        """
        if start_time and end_time:
            return (
                self.transcriptions_ref.order_by_child("timestamp")
                .start_at(start_time)
                .end_at(end_time)
                .get()
            )
        if start_time:
            return (
                self.transcriptions_ref.order_by_child("timestamp")
                .start_at(start_time)
                .get()
            )
        if end_time:
            return (
                self.transcriptions_ref.order_by_child("timestamp")
                .end_at(end_time)
                .get()
            )
        return self.transcriptions_ref.get()

    def get_transcription(self, transcription_id: str):
        """
        Get a transcription from the database.
        """
        return self.transcriptions_ref.child(transcription_id).get()

    def create_transcription(self, data: dict):
        """
        Create a transcription in the database.
        """
        return self.transcriptions_ref.push(data)

    def delete_transcription(self, transcription_id: str):
        """
        Delete a transcription from the database.
        """
        self.transcriptions_ref.child(transcription_id).delete()

    def get_memories(self):
        """
        Get all memories from the database.
        """
        return self.memories_ref.get()

    def get_memory(self, memory_id: str):
        """
        Get a memory from the database.
        """
        return self.memories_ref.child(memory_id).get()

    def create_memory(self, data: dict):
        """
        Create a memory in the database.
        """
        return self.memories_ref.push(data)

    def update_memory(self, memory_id: str, data: dict):
        """
        Update a memory in the database.
        """
        self.memories_ref.child(memory_id).update(data)

    def delete_memory(self, memory_id: str):
        """
        Delete a memory from the database.
        """
        self.memories_ref.child(memory_id).delete()


if __name__ == "__main__":
    db = Database()

    new_transcription = {"text": """
    bruh
    """, "timestamp": "2025-01-23 12:37:24"}

    db.create_transcription(new_transcription)

    # db.transcriptions_ref.delete()
    # db.memories_ref.delete()

    # if not db.uploadthing_token:
    #     print("ERROR: UPLOADTHING_TOKEN not found in environment variables")
    #     exit(1)

    # print("\n=== Testing Upload Functionality ===")
    # print(f"Using Uploadthing token: {db.uploadthing_token[:5]}...")

    # test_image = "https://images.ctfassets.net/kftzwdyauwt9/4kSOjNUoQbwtFxwr5Arer4/27008d923fdcee81834048e92c3ebe43/IMG_6112.png?w=3840&q=90&fm=webp"
    # print("\nTest 1: Uploading sample image")
    # print(f"Source URL: {test_image}")

    # test_memory = {
    #     "topic": "Test Memory",
    #     "dalle_prompt": "A test image",
    #     "timestamp": time.strftime("%Y-%m-%d %H-%M-%S"),
    # }
    # print("\nCreating test memory:")
    # print(json.dumps(test_memory, indent=2))

    # memory_ref = db.create_memory(test_memory)
    # memory_id_ref = memory_ref.key
    # print(f"Created memory with ID: {memory_id_ref}")

    # result = db.upload_image(test_image)
    # if result:
    #     print("Upload successful!")
    #     print(f"Uploaded URL: {result}")

    #     # Update memory with image URL
    #     test_memory["image_url"] = result
    #     db.update_memory(memory_id_ref, test_memory)
    #     print("\nUpdated memory with image URL:")
    #     print(json.dumps(test_memory, indent=2))

    #     # Verify memory update
    #     updated_memory = db.get_memory(memory_id_ref)
    #     print("\nVerified memory content:")
    #     print(json.dumps(updated_memory, indent=2))
    # else:
    #     print("\nFailed to upload image")

    # print("\nCleaning up test memory...")
    # db.delete_memory(memory_id_ref)
    # print("Test memory deleted")

    # print("\n=== Test Summary ===")
    # print("✓ Memory Creation:", "✅")
    # print("✓ Image Upload:", "✅" if result else "❌")
    # print(
    #     "✓ Memory Update:",
    #     "✅" if result and updated_memory.get("image_url") == result else "❌",
    # )
    # print("\nIf successful, the uploaded URL should be accessible in a browser")
    # print("========================\n")
