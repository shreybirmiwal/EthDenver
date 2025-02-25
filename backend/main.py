from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
import requests
import base64
from openai import OpenAI
import os


load_dotenv()
app = Flask(__name__)
client = OpenAI()
perplexity_client = OpenAI(base_url="https://api.perplexity.ai", api_key = os.environ.get("PPLX_API_KEY"))

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
            
        query = "Return in valid JSON only. First, examine the following user query and determine if it states/matches any of the following locations: {0:Denver, 1:Austin, 2:NYC}. If it is, please return the index of the place in the json response in ‘location’ if no location exists, return -1. Finally, check if this requires a 'face_search' , return True of False. This query should be checking if the user is asking to get details on a face or not. Here is an example query “Find me the person who is on stage in ethDenver now” —> return JSON: {“location”:0, “face_search”:true} explanation: we need 0th location(denver) and we need face search to get the person. here is another example:  “Find me the person in orange jumpsuit escaping prison” —> return JSON: {“location”:-1, “face_search”:true}. Explanation: we cant search by location bc we dont know and it doesnt match the location searches,. we need face_search to get the face details. “Find the stolen red car” —> return JSON: {“location”:-1, “face_search”:false}. Explanation: we cant search by location bc we dont know and it doesnt match the location searches,. we cant use face_search because we arent searching for a specific face. thanks! USER QUERY:" + data['prompt'] 
        
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
            return jsonify({"uid": cam_id, **metadata})
        
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
        return jsonify(cameras)
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


@app.route('/api/answer_query_no_face', methods=['POST'])
def answer_query_no_face():
    print("STARTED ANSWER QUERY NO FACE")

    try:
        data = request.get_json()
        if not data:
            print("ERROR: No JSON data received")
            return jsonify({"error": "No JSON data received"}), 400

        print("RECEIVED DATA:", data)  # Debugging log

        cam_data = data.get('cam')
        prompt = data.get('prompt')

        if not cam_data or not prompt:
            print("ERROR: Missing 'cam' or 'prompt' in request")
            return jsonify({"error": "Missing 'cam' or 'prompt'"}), 400

        print("GOT CAM DATA", cam_data)
        print("GOT PROMPT", prompt)

        image_url = cam_data.get('image_url')

        if not image_url:
            print("ERROR: No image URL provided")
            return jsonify({"error": "No image URL provided"}), 400

        # Step 1: Download the image
        response = requests.get(image_url, stream=True)

        if response.status_code != 200:
            print(f"Failed to download image, status code: {response.status_code}")
            return jsonify({"error": f"Failed to download image, status code: {response.status_code}"}), 500

        # Step 2: Convert image to base64
        img_data = response.content
        img_base64 = base64.b64encode(img_data).decode("utf-8")

        # Step 3: Send image to OpenAI API for analysis
        openai_response = client.chat.completions.create(
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

        return jsonify({"response": openai_response.choices[0].message.content})

    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return jsonify({"error": f"Error analyzing image: {str(e)}"}), 500


@app.route('/api/add_camera', methods=['POST'])
def add_camera():
    try:
        data = request.json
        required_fields = ["uid", "location", "image_url", "description", 'walletID']
        if any(field not in data for field in required_fields):
            return jsonify({'error': 'Missing fields in request'}), 400


        image_frame_description = getImage_Description(data['image_url'])

        # Vector embed the description.
        embedding = embed_text(data['description'] + image_frame_description)

        # Add camera stream to the Chroma collection.
        camera_collection.add(
            documents=[data['description']],
            metadatas=[{
                "location": data['location'],
                "image_url": data['image_url'],
                "description": data['description'] + image_frame_description,
                "walletID": data['walletID']
            
            }],
            ids=[data['uid']],
            embeddings=[embedding]
        )
        return jsonify({'message': 'Camera added successfully'}), 200
    except Exception as e:
        print(f"Error adding camera: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/answer_query_face', methods=['POST'])
def answer_query_face():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        cam_url = data.get('cam_url')

        # CALL hyperbolic agent
        hyper_answer = "Sreeram Kannan"

        #call perplexity model to answer now
        response = perplexity_client.chat.completions.create(
            model="sonar-pro",
            messages=[
                {   
                    "role": "user",
                    "content": (
                        f"NAME: {hyper_answer}. Given someones name, try to find details about them, such as age, profession, linkdin, twitter. Return with no extra words and include name , return in this format:\nNAME: Bob\nAGE: 22\nPROFESSION: Software Engineer\nLINKEDIN: https://linkedin.com/sreeram\nTWITTER: https://twitter.com/sreeram"
                    ),
                },
            ],
        )
        print(response)
        print(response.choices[0].message.content)
        return response.choices[0].message.content

    except Exception as e:
        return jsonify({'error': str(e)}), 500


    
if __name__ == '__main__':
    app.run(debug=True)