from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
client = OpenAI()

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
    
if __name__ == '__main__':
    app.run(debug=True)