import requests

# Define the URL and headers
url = "https://autonome.alt.technology/cdptest-fuvmye/chat"
headers = {
    "Authorization": "Basic Y2RwdGVzdDpyZnFQS2piWkto",
    "Content-Type": "application/json"  # Adjust if needed
}


camId = "1"
title = "Desciption"
description= "A robbery occured"
imageURL= f"https://blockworks.co/_next/image?url=https%3A%2F%2Fblockworks-co.imgix.net%2Fwp-content%2Fuploads%2F2023%2F06%2FSreeram-Kannan.jpg&w=384&q=75"
location= ""
sendTo="0x5af59F54065364c9CB99f137D8190edE6d59cA78"

# Optional: Define the payload if the API requires a request body
data = {
    "message": f"Given the following details: Description: {description} Location: {location} ImageURL: {imageURL}, can you mint an nft from this and send to this address {sendTo}"
}

# Make the GET or POST request (modify as needed)
response = requests.post(url, json=data, headers=headers)  # Change to requests.post(url, json=data, headers=headers) if using POST

# Print the response
print(response.status_code)
print(response.json())  # Use response.text if the response is not JSON


#curl --location --request GET 'https://autonome.alt.technology/cdptest-fuvmye/agents' --header 'Authorization: Basic Y2RwdGVzdDpyZnFQS2piWkto
