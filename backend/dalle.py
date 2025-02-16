"""
Generates an image using DALL-E.
"""

import os
from typing import Optional, Tuple

import openai
from dotenv import load_dotenv

load_dotenv()

class DalleImage:
    """
    Generates an image using DALL-E.
    """
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")

    def generate_memory_image(self, memory_data: dict) -> Tuple[Optional[str], Optional[str]]:
        """
        Generates an image for a memory using its dalle_prompt.
        Returns a tuple of (dalle_url, error_message).
        """
        prompt = memory_data.get('dalle_prompt')
        if not prompt:
            return None, "No DALL-E prompt found in memory"

        try:
            response = openai.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size="1024x1024",
                quality="standard",
            )
            image_url = response.data[0].url
            return image_url, None
        # pylint: disable=broad-except
        except Exception as e:
            error_msg = f"Error generating image: {str(e)}"
            print(error_msg)
            return None, error_msg

    def generate_image(self, prompt: str, size: str = "1024x1024") -> Optional[str]:
        """
        Generates an image using DALL-E 3.
        """
        try:
            response = openai.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size=size,
                quality="standard",
            )
            return response.data[0].url
        # pylint: disable=broad-except
        except Exception as e:
            print(f"Error generating image: {e}")
            return None

if __name__ == "__main__":
    dalle = DalleImage()
    PROMPT = "Generate an image of a cat"
    generated_url = dalle.generate_image(PROMPT)
    print(generated_url)
