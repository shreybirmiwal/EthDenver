import cv2
import torch
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration


#1. Run docker desktop

#2. docker run --rm -it -p 8554:8554 aler9/rtsp-simple-server

#3. #ffmpeg -re -stream_loop -1 -i /c/Users/xvize/Downloads/jp.MP4 -rtsp_transport tcp -c copy -f rtsp rtsp://localhost:8554/mystream

#3.1 optional: -vf "transpose=1,scale=640:480"

#4. run this script


# 1. Load environment variables from .env file
load_dotenv()

# 2. Get Supabase URL and anon key from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# 3. Create a Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# ---------------------------------------------------------------------------
# 2. IMAGE CAPTIONING MODEL (BLIP)
# ---------------------------------------------------------------------------
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model.eval()

def generate_caption(frame):
    """
    Convert a CV2 frame into a PIL image, run BLIP to generate a caption.
    """
    # Convert BGR (OpenCV) to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    
    # Prepare inputs for BLIP
    inputs = processor(pil_image, return_tensors="pt")
    
    # Inference
    with torch.no_grad():
        out = caption_model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

# 3. OPTIONAL: YOLO DETECTION (If you still want bounding boxes)
# ---------------------------------------------------------------------------
use_yolo = False  # Toggle this to True if you also want object detection

# 4. Load a pre-trained YOLOv5s model (small version) from Ultralytics
if use_yolo:
    yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    yolo_model.eval()

def run_yolo(frame):
    """
    Run YOLO on the frame and return a list of detections with bounding boxes.
    """
    results = yolo_model(frame)
    raw_detections = results.xyxy[0].cpu().numpy().tolist()
    
    readable_detections = []
    for det in raw_detections:
        x1, y1, x2, y2, conf, cls = det
        label = yolo_model.names[int(cls)]
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
    return readable_detections


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
    # -----------------------------------------------------------------------
    # A) Generate a scene caption
    # -----------------------------------------------------------------------
    scene_caption = generate_caption(frame)
    # Run inference on the current frame
    # -----------------------------------------------------------------------
    # B) (Optional) Run YOLO detection
    # -----------------------------------------------------------------------
    if use_yolo:
        detections = run_yolo(frame)
        # Draw YOLO bounding boxes if desired
        for det in detections:
            bbox = det["bbox"]
            label = det["label"]
            conf = det["confidence"]
            cv2.rectangle(frame, (int(bbox["x1"]), int(bbox["y1"])),
                          (int(bbox["x2"]), int(bbox["y2"])), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {conf:.2f}",
                        (int(bbox["x1"]), int(bbox["y1"]) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # -----------------------------------------------------------------------
    # C) Display the video feed (with or without YOLO boxes)
    # -----------------------------------------------------------------------
    cv2.imshow("RTSP Stream with Captioning", frame)
    
    # Print caption to console for debugging
    print(f"Frame {frame_counter}: {scene_caption}")
    
    # -----------------------------------------------------------------------
    # D) Store results to Supabase every N frames
    # -----------------------------------------------------------------------
    frame_counter += 1
    if frame_counter % store_every == 0:
        data_payload = {
            "camera_id": "vizzy",
            "created_at": datetime.utcnow().isoformat(),
            "caption": scene_caption
        }
        if use_yolo:
            data_payload["detections"] = detections
        
        response = supabase.table("inferences").insert(data_payload).execute()
        print("Inserted inference record:", response)
    
    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()