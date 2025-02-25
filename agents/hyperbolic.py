import requests

# Define the URL and headers
url = "https://autonome.alt.technology/hyper-lqlrtj"
headers = {
    "Authorization": "Basic aHlwZXI6eHZxaUpVdENTbQ==",
    "Content-Type": "application/json"  # Adjust if needed
}

# Optional: Define the payload if the API requires a request body
data = {
    "message": "Hello, Hyperbolic Agent!"  # Adjust based on API requirements
}

# Make the GET or POST request (modify as needed)
response = requests.get(url, headers=headers)  # Change to requests.post(url, json=data, headers=headers) if using POST

# Print the response
print(response.status_code)
print(response.json())  # Use response.text if the response is not JSON




# usage of docker container
# replce images.jpeg with actual path to image

#docker run --rm -v $(pwd)/images.jpeg:/app/input_image.jpg shreybirmiwal/face-detect:latest python face_recognition_script.py input_image.jpg