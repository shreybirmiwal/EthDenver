import cv2
import torch
import os
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
import warnings
import numpy as np
import threading
import time
from httpx import RemoteProtocolError
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from ultralytics import YOLO
model = YOLO("yolov8n.pt")  # Load YOLOv8 Nano (smallest model)

#1. Run docker desktop

#2. docker run --rm -it -p 8554:8554 aler9/rtsp-simple-server

#3. #ffmpeg -re -stream_loop -1 -i /c/Users/xvize/Downloads/storerobbery.MP4 -rtsp_transport tcp -c copy -f rtsp rtsp://localhost:8554/mystream

#3.1 optional: -vf "transpose=1,scale=640:480"

#4. run this script

# Load the BLIP processor and captioning model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

warnings.filterwarnings("ignore", category=FutureWarning)

# 1. Load environment variables from .env file
load_dotenv()

# 2. Get Supabase URL and anon key from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# 3. Create a Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# 4. Load a pre-trained YOLOv5s model (small version) from Ultralytics
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True, force_reload=True)
model.eval()

# Function to upload frame to Supabase Storage
def upload_frame_to_storage(bucket_name, file_name, frame, supabase_client):
    # Encode the frame as a JPEG image
    success, encoded_image = cv2.imencode('.jpg', frame)
    if not success:
        raise Exception("Could not encode frame as image")
    
    # Convert the encoded image to bytes
    image_bytes = encoded_image.tobytes()
    
    # Always remove the file first (if it exists) to avoid duplicate errors.
    try:
        remove_response = supabase_client.storage.from_(bucket_name).remove([file_name])
        print("Removed existing file (if any) before upload.")
    except Exception as e:
        print("Error removing existing file (this might be fine if the file doesn't exist):", e)
    
    # Now upload the image bytes to Supabase Storage
    response = supabase_client.storage.from_(bucket_name).upload(file_name, image_bytes)
    
    # Check for errors using attribute access
    if hasattr(response, "error") and response.error:
        raise Exception("Failed to upload image: " + str(response.error))
    
    # Retrieve the public URL for the uploaded image
    public_url = supabase_client.storage.from_(bucket_name).get_public_url(file_name)
    return public_url

# Optional: Function to update email_updates with retry logic.
def update_email_updates(camera_id, new_updates, max_retries=3):
    for attempt in range(max_retries):
        try:
            update_response = supabase.table("email_updates").update({"updates": new_updates}).eq("camid", camera_id).execute()
            print(f"{camera_id} - Updated email_updates:", update_response)
            return update_response
        except RemoteProtocolError as e:
            print(f"{camera_id} - Update failed due to connection error: {e}. Retrying ({attempt+1}/{max_retries})...")
            time.sleep(1)
    print(f"{camera_id} - Update failed after {max_retries} attempts.")
    return None

# Function to process an RTSP stream
def process_stream(rtsp_url, camera_id, window_name):
    cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream {rtsp_url}")
        return

    frame_counter = 0
    store_every = 30

    while True:
        ret, frame = cap.read()
        if not ret:
            print(f"Stream {camera_id} ended or error encountered.")
            break

        # Run inference on the current frame
        results = model(frame)  # YOLOv8 returns a list of Results objects

        # Extract detections (bounding boxes, confidences, and class indices)
        boxes = results[0].boxes  # Access the first (and only) Results object
        raw_detections = boxes.xyxy.cpu().numpy()  # Bounding boxes in [x1, y1, x2, y2] format
        confidences = boxes.conf.cpu().numpy()  # Confidence scores
        class_ids = boxes.cls.cpu().numpy()  # Class IDs

        # Convert raw detections into human-readable format
        readable_detections = []
        for i in range(len(raw_detections)):
            x1, y1, x2, y2 = raw_detections[i]
            conf = confidences[i]
            cls = class_ids[i]
            label = model.names[int(cls)]  # Get class label from class ID
            readable_detections.append({
                "label": label,
                "confidence": float(conf),
                "bbox": {
                    "x1": float(x1),
                    "y1": float(y1),
                    "x2": float(x2),
                    "y2": float(y2)
                }
            })

        # Draw bounding boxes on the frame
        for det in readable_detections:
            bbox = det["bbox"]
            label = det["label"]
            confidence = det["confidence"]
            cv2.rectangle(frame, (int(bbox["x1"]), int(bbox["y1"])),
                          (int(bbox["x2"]), int(bbox["y2"])), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {confidence:.2f}", (int(bbox["x1"]), int(bbox["y1"]) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Display the frame in a window named after the stream
        cv2.imshow(window_name, frame)

        # Throttle the data storage to every 'store_every' frames
        frame_counter += 1
        print(f"{camera_id} - Frame count: {frame_counter}")

        if frame_counter % store_every == 0:
            print(f"{camera_id} - Storing inference results to Supabase...")
            # Use a fixed file name so that the same URL is updated every time.
            file_name = f"latest_frame_{camera_id}.jpg"
            try:
                frame_url = upload_frame_to_storage("camera_frames", file_name, frame, supabase)
            except Exception as e:
                print(f"{camera_id} - Error uploading frame:", e)
                frame_url = None
            
            # Generate a caption using BLIP captioning model
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            inputs = processor(pil_image, return_tensors="pt")
            caption_ids = caption_model.generate(**inputs)
            caption_text = processor.decode(caption_ids[0], skip_special_tokens=True)
            print(f"{camera_id} - Caption: {caption_text}")

            # Insert inference record with the caption included
            data = {
                "camera_id": camera_id,
                "results": readable_detections,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "frame_url": frame_url,
                "caption": caption_text
            }
            response = supabase.table("inferences").insert(data).execute()
            print(f"{camera_id} - Inserted inference record:", response)

            # Build an update string using the caption instead of just object labels
            update_string = f"Frame {frame_counter}: {caption_text}"

            # Retrieve current updates (if any) for this camera (using camera_id)
            select_response = supabase.table("email_updates").select("updates").eq("camid", camera_id).execute()
            current_updates = ""
            if select_response.data and len(select_response.data) > 0:
                current_updates = select_response.data[0].get("updates", "")

            if current_updates:
                new_updates = current_updates + ", " + update_string
            else:
                new_updates = update_string

            # Update the 'email_updates' table using our helper function
            update_response = update_email_updates(camera_id, new_updates)
            # If no row was updated, insert a new row.
            if not update_response or not update_response.data:
                insert_response = supabase.table("email_updates").insert({"camid": camera_id, "updates": new_updates}).execute()
                print(f"{camera_id} - Inserted new email_updates row:", insert_response)

        # Exit on pressing 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyWindow(window_name)

# Define stream configurations
streams = [
    {"rtsp_url": "rtsp://localhost:8554/mystream", "camera_id": "vizzy", "window_name": "Stream: vizzy"},
    {"rtsp_url": "rtsp://localhost:8554/robberystream", "camera_id": "cam1", "window_name": "Stream: Robbery"}
]

# Launch threads for each stream
threads = []
for stream in streams:
    t = threading.Thread(target=process_stream, kwargs=stream)
    t.start()
    threads.append(t)

for t in threads:
    t.join()
