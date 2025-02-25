import requests
from PIL import Image

def download_and_display_image(url):
    # Send a GET request to the image URL
    response = requests.get(url, stream=True)

    # Check if the request was successful
    if response.status_code == 200:
        # Open the response content as an image
        image = Image.open(response.raw)
        image.show()
    else:
        print("Failed to download the image.")

# Example usage
image_url = "https://dfqmrezotheoxdpmmpgu.supabase.co/storage/v1/object/public/camera_frames/latest_frame.jpg?"
download_and_display_image(image_url)



Traceback (most recent call last):
  File "C:\Users\xvize\EthDenver\test.py", line 18, in <module>
    download_and_display_image(image_url)
  File "C:\Users\xvize\EthDenver\test.py", line 11, in download_and_display_image
    image = Image.open(response.raw)
            ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\xvize\AppData\Local\Programs\Python\Python312\Lib\site-packages\PIL\Image.py", line 3339, in open
    raise UnidentifiedImageError(msg)
PIL.UnidentifiedImageError: cannot identify image file <_io.BytesIO object at 0x000002CC4F4EEB10>
PS C:\Users\xvize\EthDenver> 
