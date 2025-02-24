import sys
import os
import requests
import face_recognition
from PIL import Image

# Directory containing known faces
KNOWN_FACES_DIR = "known_faces"

def download_image(image_url):
    """Downloads an image from a URL and saves it locally."""
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        image_path = "input_image.jpg"
        with open(image_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return image_path
    else:
        print("Error: Unable to download image.")
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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python face_recognition_script.py <image_url>")
        sys.exit(1)

    image_url = sys.argv[1]
    image_path = download_image(image_url)

    if image_path:
        known_faces = encode_known_faces()
        result = recognize_faces(image_path, known_faces)
        print(result)
