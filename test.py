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
image_url = "https://example.com/image.jpg"
download_and_display_image(image_url)