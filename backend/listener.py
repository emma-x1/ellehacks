"""
Listens for audio input from the microphone and saves it to a WAV file.
"""

import datetime
import os
from collections import deque

import numpy as np
import sounddevice as sd
import wavio as wv

SAMPLE_RATE = 44100
CHUNK_DURATION = 0.5
CHUNK_SIZE = int(SAMPLE_RATE * CHUNK_DURATION)
SILENCE_THRESHOLD = 0.01
SILENCE_DURATION = 2.0

os.makedirs("./recordings", exist_ok=True)


def rms(data):
    """Calculate Root Mean Square (RMS) of audio data."""
    return np.sqrt(np.mean(np.square(data)))

def stream_record():
    """
    Streams audio from the microphone and saves it to a WAV file.
    """
    buffer = deque(maxlen=int(SILENCE_DURATION / CHUNK_DURATION))
    full_buffer = []
    is_recording = False
    speech_start_index = 0

    print("Recording... Speak into the microphone.")

    def callback(indata, _frames, _time, status):
        nonlocal is_recording, speech_start_index, full_buffer

        if status:
            print(f"Error: {status}", flush=True)

        mono_data = indata.flatten()
        full_buffer.append(mono_data)
        buffer.append(mono_data)

        loudness = rms(mono_data)
        has_speech = loudness > SILENCE_THRESHOLD
        print("Loudness:", loudness, "Silence threshold:", SILENCE_THRESHOLD, "Has speech:", has_speech)

        if has_speech:
            if not is_recording:
                print("Speech detected. Starting recording...")
                is_recording = True
                speech_start_index = len(full_buffer) - len(buffer)
        else:
            if (
                is_recording
                and len(buffer) == buffer.maxlen
                and all(rms(chunk) <= SILENCE_THRESHOLD for chunk in buffer)
            ):
                print("Silence detected. Stopping recording.")
                save_recording(full_buffer[speech_start_index:])
                buffer.clear()
                is_recording = False

    with sd.InputStream(
        callback=callback, channels=1, samplerate=SAMPLE_RATE, blocksize=CHUNK_SIZE
    ):
        try:
            sd.sleep(int(3600 * 10000))
        except KeyboardInterrupt:
            print("Recording interrupted by user.")
        finally:
            if is_recording:
                print("Finalizing recording...")
                save_recording(full_buffer[speech_start_index:])
            print("Recording stopped.")


def save_recording(audio_data):
    """Save the buffered audio to a WAV file."""
    if not audio_data:
        return
    audio_data = np.concatenate(audio_data)
    ts = datetime.datetime.now()
    filename = ts.strftime("%Y-%m-%d %H-%M-%S") + ".wav"
    file_path = os.path.join("./recordings", filename)
    wv.write(file_path, audio_data, SAMPLE_RATE, sampwidth=2)
    print(f"Saved recording to {file_path}")


stream_record()
