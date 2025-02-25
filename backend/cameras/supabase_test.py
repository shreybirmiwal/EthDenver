from supabase import create_client, Client
import os
import json
from dotenv import load_dotenv

load_dotenv()
# Replace with your actual Supabase URL and anon key or set them as environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Create a Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Sample inference result data
inference_data = {
    "detected_objects": ["person", "car"],
    "scene_description": "A busy street scene with pedestrians."
}

# Data to insert into the table
data = {
    "camera_id": "cam_test",
    "results": inference_data,  # supabase-py handles JSON conversion automatically
    "frame_url": "https://example.com/frame.jpg"  # optional
}

# Insert the data into the 'inferences' table
response = supabase.table("inferences").insert(data).execute()
print(response)
