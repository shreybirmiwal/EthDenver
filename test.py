
import requests

def download_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        with open('image.jpg', 'wb') as file:
            file.write(response.content)
        print('Image downloaded successfully.')
    else:
        print('Failed to download image.')

    

url = "https://people.ece.uw.edu/kannan_sreeram/kannan_sreeram_2016_200x267.jpg"
download_image(url)