import cv2
import torch
import os
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
import warnings
import numpy as np

warnings.filterwarnings("ignore", category=FutureWarning)

# 1. Load environment variables from .env file
load_dotenv()

# 2. Get Supabase URL and anon key from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# 3. Create a Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# 4. Load a pre-trained YOLOv5s model (small version) from Ultralytics
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
model.eval()

# 5. Use your local RTSP URL
rtsp_url = "rtsp://localhost:8554/mystream"
cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)

if not cap.isOpened():
    print("Error: Could not open RTSP stream.")
    exit()

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

# A counter to throttle how often we store data (e.g., every 30 frames)
frame_counter = 0
store_every = 30

while True:
    ret, frame = cap.read()
    if not ret:
        print("Stream ended or error encountered.")
        break

    # Run inference on the current frame
    results = model(frame)
    
    # Extract raw detections (bounding boxes, confidences, and class indices)
    raw_detections = results.xyxy[0].cpu().numpy().tolist()  # Convert to list for JSON serialization

    # Convert raw detections into human-readable format
    readable_detections = []
    for det in raw_detections:
        x1, y1, x2, y2, conf, cls = det
        label = model.names[int(cls)]
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

    # Display the frame
    cv2.imshow("RTSP Stream with inference", frame)

    # Throttle the data storage to every 'store_every' frames
    frame_counter += 1
    print(f"Frame count: {frame_counter}")  # Debug: show frame count

    if frame_counter % store_every == 0:
        print("Storing inference results to Supabase...")  # Debug: if condition triggered

        # Use a fixed file name so that the same URL is updated every time
        file_name = "latest_frame.jpg"
        
        # Replace 'camera_frames' with the actual bucket name you created in Supabase Storage
        try:
            frame_url = upload_frame_to_storage("camera_frames", file_name, frame, supabase)
        except Exception as e:
            print("Error uploading frame:", e)
            frame_url = None
        
        # Build the data payload for Supabase using human-readable detections
        data = {
            "camera_id": "vizzy",  # Replace with your actual camera id if available
            "results": readable_detections,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "frame_url": frame_url  # Store the image URL
        }
        # Insert the record into Supabase
        response = supabase.table("inferences").insert(data).execute()
        print("Inserted inference record:", response)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
