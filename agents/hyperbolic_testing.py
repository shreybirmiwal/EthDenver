





# Image generation
import requests
import base64

# Replace with your actual API key
HYPERBOLIC_API_KEY = "YOUR_API_KEY_HERE"

url = "https://api.hyperbolic.xyz/v1/image/generation"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {HYPERBOLIC_API_KEY}"
}
payload = {
    "model_name": "SDXL1.0-base",
    "prompt": "a photo of an astronaut riding a horse on mars",
    "height": 1024,
    "width": 1024,
    "backend": "auto"
}

response = requests.post(url, headers=headers, json=payload)

if response.status_code == 200:
    # Convert the response to JSON
    data = response.json()
    
    # Extract the base64 image string from the JSON
    base64_image = data["images"][0]["image"]
    
    # Decode the base64 string
    image_bytes = base64.b64decode(base64_image)
    
    # Save to a file
    with open("result.jpg", "wb") as f:
        f.write(image_bytes)
    
    print("Image saved as result.jpg")
else:
    print(f"Request failed: {response.status_code}\n{response.text}")
