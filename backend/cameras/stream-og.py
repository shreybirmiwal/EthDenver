import cv2
import torch
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import warnings
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
    # results.xyxy[0] contains detections in [x1, y1, x2, y2, confidence, class]
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

        # Build the data payload for Supabase using human-readable detections
        data = {
            "camera_id": "vizzy",  # Replace with your actual camera id if available
            "results": readable_detections,
            "created_at": datetime.utcnow().isoformat()  # Optional if your table sets a default timestamp
            # "frame_url": "https://example.com/frame.jpg"  # Optional: add if storing frame image elsewhere
        }
        # Insert the record into Supabase
        response = supabase.table("inferences").insert(data).execute()
        print("Inserted inference record:", response)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
