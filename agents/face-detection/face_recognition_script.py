import sys
import os
import requests
import face_recognition
from PIL import Image
from urllib.parse import urlparse

# Directory containing known faces
KNOWN_FACES_DIR = "known_faces"

def download_image(image_url):
    """Downloads an image from a URL and saves it locally."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(image_url, headers=headers, stream=True, allow_redirects=True)
        response.raise_for_status()  # Raise error if request fails
        
        image_path = "input_image.jpg"
        with open(image_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return image_path
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image: {e}")
        return None

def encode_known_faces():
    """Encodes all known faces and returns a dictionary {name: encoding}."""
    known_encodings = {}
    
    for filename in os.listdir(KNOWN_FACES_DIR):
        filepath = os.path.join(KNOWN_FACES_DIR, filename)
        if not filename.endswith(('.jpg', '.jpeg', '.png')):
            continue
        
        name = os.path.splitext(filename)[0]  # Extract name from filename
        image = face_recognition.load_image_file(filepath)
        encodings = face_recognition.face_encodings(image)

        if encodings:
            known_encodings[name] = encodings[0]
    
    return known_encodings

def recognize_faces(image_path, known_encodings):
    """Compares an input image with known faces and returns the closest match."""
    unknown_image = face_recognition.load_image_file(image_path)
    unknown_encodings = face_recognition.face_encodings(unknown_image)

    if not unknown_encodings:
        return "No face detected in the input image."

    unknown_encoding = unknown_encodings[0]
    
    for name, known_encoding in known_encodings.items():
        match = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.6)
        if match[0]:
            return f"Match found: {name}"
    
    return "No match found."

def is_url(string):
    """Checks if the input string is a URL."""
    parsed = urlparse(string)
    return bool(parsed.netloc) and bool(parsed.scheme)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python face_recognition_script.py <image_path_or_url>")
        sys.exit(1)

    input_source = sys.argv[1]

    if is_url(input_source):
        print("Downloading image from URL...")
        image_path = download_image(input_source)
    elif os.path.exists(input_source):
        print("Using local image file...")
        image_path = input_source
    else:
        print("Error: Invalid image source (not a valid file or URL).")
        sys.exit(1)

    if image_path:
        known_faces = encode_known_faces()
        result = recognize_faces(image_path, known_faces)
        print(result)
