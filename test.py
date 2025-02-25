import requests
from PIL import Image
import io

def download_and_display_image(url):
    # Send a GET request to the image URL
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Open the response content as an image using BytesIO
        image = Image.open(io.BytesIO(response.content))
        image.show()
    else:
        print(f"Failed to download the image. Status code: {response.status_code}")

# Example usage
image_url = "https://dfqmrezotheoxdpmmpgu.supabase.co/storage/v1/object/public/camera_frames/latest_frame.jpg?"
download_and_display_image(image_url)
