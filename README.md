![unagi logo](https://github.com/user-attachments/assets/b0d63934-af12-4221-a9bd-83a5d446f6e8)

## What is Unagi Network?
**Unagi Network is the eyeballs for AI x Crypto Agents** <br/>
Unagi Network is a dePin network of security cameras (autonomously verified as legit off-chain on EigenLayer) and designed for agentic querying.


**Why should I care?** <br/>
The current state of AI crypto agents brings privacy and decentralization - but to do what? Send tweets and buy memecoins?
By bringing on-chain verified cameras, we can now create agents that do more useful things, like file insurance claims or prove alibi in court (in a verifiable trustless way). If agents that can tweet create $10m+ in value, imagine how much value agents that can _actually_ do things will create.


**What's the name mean lol** <br/>
Unagi means "a state of total awareness" ([reference](https://www.youtube.com/watch?v=UPW3iSLPrPg)) as coined by Ross Geller in a Friends episode.


**Our Favorite Use Cases** <br/>
- “Find me who stole my car and file an insurance claim with the footage.”

- “Book an Uber to the tennis courts, if they appear to be dry enough to play”

- “Email me of any suspicious activity in Denver that you detect”


**Demo Video**
[DEMO VIDEO HERE 


## Technical Deep-Dive
![Autonomously Verified Service (Othentic + EigenLayer) (1)](https://github.com/user-attachments/assets/f2bafba1-bb67-481f-8be8-73269df1f20f)


### Step 1: Supplying 'UNAGI' (being a supplier of video stream footage)

- Upload details of your camera to our network
- Mints an IP Story Protocol NFT of the camera and saves your stream to the database
- Calls the Othentic AVS for executioners/validators to run a 'deep-fake' detection and store results on-chain (thus verifying the camera)

<img width="683" alt="Screenshot 2025-02-27 at 8 25 16 AM" src="https://github.com/user-attachments/assets/f32a3448-edb7-4f0e-ace2-67ed42622f92" />

### Step 2: Querying the network

- Ask any query, such as "Find me the man on ethDenver mainstage"
- Using a mix of agentic reasoning and vector embedding search, Unagi queries relevant cameras in the network
<img width="1437" alt="Screenshot 2025-02-27 at 9 38 55 AM" src="https://github.com/user-attachments/assets/4f836b86-bd81-4786-b775-9ff411172ae1" />


### Step 3: Agentic actions

SHOW UPDATED IMAGE OF MAP MARKER OF SREERAM
- The query found a camera on mainstage ethDenver and found the founder of EigenLayer
- You can see details about the person found in the image
- You can pay royalty or dispute the IP of the image (say if someone is using your camera footage or using illegal footage location)
- You can run agentic actions, like automatically create on-chain insurance claims (if this was a camera pointed at a burglarly or car crash etc)

   
There are two primary users for this project: camera providers and end-users. Camera Providers can upload their camera RTSP live streams into our network, and end users can write a query in our project, which will access and return cameras that contain the given query (ie look for robbery). Location search has also been added, allowing end users to select a camera on the map to get its details.


Due to processing constraints, a script snapshots the camera livestreams, and uploads every 30th frame as the image. The following details are stored for every camera:


CameraID

Location

ImageURL of the current frame

Timestamp of the current frame

Description of the current frame


When a camera is returned from a user's query, the camera provider is given tokenized rewards.

# Demo Video

# Integrations
If you were a sponsor and wanted to see how we used your integration in our project, see below.

### Autonome
Autonome acts as our agent hosting layer. We use agentic actions in our platform to do things like 'automatically create insurance claims' based on camera footage on chain

We had Autonome host our Coinbase Developer Platform (CDP) agentKit agent. After deploying this agent, we called the Autonome API and prompted our agent to mint an NFT that acts as an insurance claim.

Future: One future implementation would be to deploy our own agent framework that does CDP SDK + AgentKit, which would allow us to execute smart contracts

Feedback: Hyperbolic agent had some issues working until the dev team launched a v2. Implementing autonome into our code was also quite challenging, as the curl commands weren't working.

## Story Protocol
Story Protocol was crucial in creating the incentive structure for camera providers. When a provider uploads their live stream, our application mints the imageURL as an NFT and registers it as an IPA. The camera provider is then paid a royalty every time a user queries that camera, incentivizing providers to be a part of the network.

Future: We want to be able to have the frames collected by the camera to be put into a collection, giving users the ability to see previous significant frames queried by users.

Feedback: Our app was created using React.js, so it took us a good amount of time to install dependencies and rework scripts to fit Story into our project - we would love to see better React.js compatibility in the future. Additionally, the typescript_tutorial was extremely helpful in quickstarting our project.

## Othentic
Othentic was used to verify that each livestream is genuine by pushing the verified data onchain using EigenLayer's restaking security model.

Future:

Feedback: The docker compose was very helpful and made it easy to add and pass data in. We'd love to see more documentation on getting the final data answer.

## Targon
The Targon implementation allowed us to identify significant changes between frames and flag them in a consolidated surveillance report, allowing for users signed up for that camera to be notified of suspicious activity.

Future: While we already detect objects using bounding boxes, we would love to implement a "history of object" feature that tracks objects movement across frames and allow users to receive reports on specific objects over selected time periods.

Feedback: We initially wanted to use targon to run image analysis inference on the frames, but we had to pivot to using a different model (BLIP) to analyze the image and then convert it to text embeddings for targon to work with.

# Installation and local developing
**Frontend (Create-React-App)**
```
cd frontend
npm install --legacy-peer-deps
npm run start
```
**Backend (Flask Server)**
```
cd backend
python3 main.py
```
Create a env for the backend:
```
#For text embeddings
OPENAI_API_KEY=
#To search face match for people details online
PPLX_API_KEY=
#To store livestream data updates
SUPABASE_URL=
SUPABASE_ANON_KEY=
#To send email updates
GOOGLE_APP_PASSWORD=
#For LLM inference
TARGON_API_KEY=
#To connect with autonome agent
API_AUTH_AUTONOME=
```
**Host a livestream**
```
1. Run docker desktop

2. docker run --rm -it -p 8554:8554 aler9/rtsp-simple-server

3. #ffmpeg -re -stream_loop -1 -i {insert_mp4_file} -rtsp_transport tcp -c copy -f rtsp rtsp://localhost:8554/mystream

4. run python multi-stream.py
```


**Privacy and Validity Concerns**

![image](https://github.com/user-attachments/assets/45a61a21-32b0-47b6-9ec9-fafd78ddc77c)

![image](https://github.com/user-attachments/assets/8a5e7a68-d1d2-48ee-ba0f-e6e3eba8ef16)

