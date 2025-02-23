from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
import requests
import base64

load_dotenv()
app = Flask(__name__)
client = OpenAI()

chroma_client = chromadb.PersistentClient()
collection_names = chroma_client.list_collections()
if "camera_streams" not in collection_names:
    camera_collection = chroma_client.create_collection("camera_streams")
else:
    camera_collection = chroma_client.get_collection("camera_streams")



def getImage_Description(image_url):
    try:
        # Step 1: Download the image
        response = requests.get(image_url, stream=True)

        if response.status_code != 200:
            return f"Failed to download image, status code: {response.status_code}"

        # Step 2: Convert image to base64
        img_data = response.content
        img_base64 = base64.b64encode(img_data).decode("utf-8")

        # Step 3: Send image to OpenAI API for analysis
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe what you see in this image in detail"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
                    ]
                }
            ],
            max_tokens=300
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error analyzing image: {str(e)}"
    

def GPT_Call(query):
    """
    Makes a call to the OpenAI GPT model with the given query.
    
    Args:
    query (str): The query to be passed to the GPT model.
    
    Returns:
    dict: The response from the GPT model.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            store=False,
            messages=[
                {"role": "user", "content": query}
            ],
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        # Get the content of the response
        response_content = completion.choices[0].message.content
        # Try to parse the response as JSON
        import json
        try:
            response_json = json.loads(response_content)
            return response_json
        except json.JSONDecodeError:
            # If the response is not valid JSON, return an error
            return {"error": "Invalid JSON response from GPT model"}
    except Exception as e:
        # If there is an error making the call to the GPT model, return an error
        return {"error": str(e)}
    
def embed_text(text):
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

@app.route('/api/hello-world')
def hello_world():
    return 'Hello, World!'

@app.route('/api/query_determine', methods=['POST'])
def query_determine():
    try:
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({'error': 'No prompt provided'}), 400
            
        query = "Return in valid JSON only. First, examine the following user query and determine if it states/matches any of the following locations: {0:Denver, 1:Austin, 2:NYC}. If it is, please return the index of the place in the json response in ‘location’ if no location exists, return -1. Finally, check if this requires a 'face-search' , return True of False. This query should be checking if the user is asking to get details on a face or not. Here is an example query “Find me the person who is on stage in ethDenver now” —> return JSON: {“location”:0, “face-search”:true} explanation: we need 0th location(denver) and we need face search to get the person. here is another example:  “Find me the person in orange jumpsuit escaping prison” —> return JSON: {“location”:-1, “face-search”:true}. Explanation: we cant search by location bc we dont know and it doesnt match the location searches,. we need face-search to get the face details. “Find the stolen red car” —> return JSON: {“location”:-1, “face-search”:false}. Explanation: we cant search by location bc we dont know and it doesnt match the location searches,. we cant use face-search because we arent searching for a specific face. thanks! USER QUERY:" + data['prompt'] 
        
        ret = GPT_Call(query)
        return jsonify(ret)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/search_cameras_description', methods=['POST'])
def search_camera_description():
    try:
        data = request.json
        if not data or "query" not in data:
            return jsonify({'error': 'No query provided'}), 400

        query_embedding = embed_text(data['query'])
        result = camera_collection.query(
            query_embeddings=[query_embedding],
            n_results=1
        )
        for cam_id, metadata in zip(result.get("ids", [])[0], result.get("metadatas", [])[0]):
            return jsonify({"uid": cam_id, **metadata}, 200)
        
        #we do it this way just to return first result
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/search_cameras_location', methods=['POST'])
def search_camera_location():
    try:
        # Parse the incoming JSON data
        data = request.json
        if not data or "uid" not in data:
            return jsonify({'error': 'No UID provided'}), 400

        # Extract the UID from the request
        camera_uid = data['uid']

        # Query the collection using the UID
        result = camera_collection.get(ids=[camera_uid])

        # Check if any result is found
        if not result.get("ids", []) or len(result["ids"]) == 0:
            return jsonify({'error': 'Camera not found'}), 404

        # Extract metadata for the first result
        cam_id = result["ids"][0]
        metadata = result["metadatas"][0]

        # Return the UID and metadata in JSON format
        return jsonify({"uid": cam_id, **metadata}), 200

    except Exception as e:
        # Handle any exceptions and return an error message
        return jsonify({'error': str(e)}), 500


# 2. Endpoint that returns all camera objects.
@app.route('/api/get_all_cameras', methods=['GET'])
def get_cameras():
    try:
        result = camera_collection.get(include=["metadatas", "documents"])
        cameras = []
        ids = result.get("ids", [])
        metadatas = result.get("metadatas", [])
        for cam_id, metadata in zip(ids, metadatas):
            cameras.append({"uid": cam_id, **metadata})
        return jsonify(cameras), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear_db', methods=['GET'])
def clear_db():

    result = camera_collection.get(include=["metadatas", "documents"])
    cameras = []
    ids = result.get("ids", [])

    camera_collection.delete(
    ids=ids,
    )

    return jsonify({'message': 'Database cleared'}), 200


@app.route('/api/answer_query_no_face', methods=['GET'])
def answer_query_no_face():

    try:
        data = request.json
        cam_data = data.cam
        prompt = data.prompt

        image_url = cam_data['image_url']

        # Step 1: Download the image
        response = requests.get(image_url, stream=True)

        if response.status_code != 200:
            return f"Failed to download image, status code: {response.status_code}"

        # Step 2: Convert image to base64
        img_data = response.content
        img_base64 = base64.b64encode(img_data).decode("utf-8")

        # Step 3: Send image to OpenAI API for analysis
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"You have an image that will help answer the prompt. The user prompt: {prompt} and the image is shown below. Please provide a response to the user prompt using the image."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
                    ]
                }
            ],
            max_tokens=300
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error analyzing image: {str(e)}"



    
if __name__ == '__main__':
    app.run(debug=True)