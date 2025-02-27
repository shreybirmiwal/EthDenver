![unagi logo](https://github.com/user-attachments/assets/b0d63934-af12-4221-a9bd-83a5d446f6e8)

## What is Unagi Network?
**Unagi Network is the eyeballs for AI x Crypto Agents** <br/>
Unagi Network is a dePin network of security cameras (autonomously verified as legit off-chain on EigenLayer) and designed for agentic querying.


**Why should I care?** <br/>
The current state of ai crypto agents brings privacy and decentralization - but to do what? Send tweets and buy memecoins?
By bringing on-chain verified cameras, we can now create agents that do more useful things, like file insurnace claims autonomously.


**What's the name mean lol** <br/>
Unagi means "a state of total awareness" ([reference](https://www.youtube.com/watch?v=UPW3iSLPrPg)) as coined by Ross Geller in an Friends episode.


**Use Cases** <br/>
- “Find me who stole my car and file an insurance claim with the footage”

- “Book an Uber to the tennis courts, if they appear to be dry enough to play”

- “Email me of any suspicious activity in Denver that you detect”


**Demo Video**
[DEMO VIDEO HERE 


## Technical Deep-Dive

![Autonomously Verified Service (Othentic + EigenLayer)-3](https://github.com/user-attachments/assets/14603b79-e95f-4c67-b6c5-bc9609e9d557)

### Step 1: Supplying 'UNAGI' (being a supplier of video stream footage)
<img width="683" alt="Screenshot 2025-02-27 at 8 25 16 AM" src="https://github.com/user-attachments/assets/f32a3448-edb7-4f0e-ace2-67ed42622f92" />
1. Upload details of your camera to our network
3. Mints an IP Story Protocol NFT of the camera and saves your stream to the database
4. Calls the Othentic AVS for executioners/validators to run a 'deep-fake' detection and store results on-chain (thus verifying the camera)

### Step 2: Querying the network


   
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

## Autonome
We utilized autonome to host our Coinbase Developer Platform (CDP) agentKit agent. After deploying this agent, we called the Autonome API and prompted our agent to mint an NFT that acts as an insurance claim.

Future: one future implementation would be to deploy our own agent framework that does CDP SDK + AgentKit, which would allow us to execute smart contracts

Feedback: Hyperbolic agent had some issues working until the dev team launched a v2. Implementing autonome into our code was also quite challenging as the curl commands weren't working.

## Story Protocol
Story Protocol was crucial in creating the incentive structure for camera providers. When a provider uploads their livestream, our application mints the imageURL as an NFT and registers it as an IPA. The camera provider is then paid a royalty every time a user queries that camera, incentivizing providers to be a part of the network.

Future: We want to be able to have the frames collected by the camera to be put into a collection, giving users the ability to see previous signficant frames queried by users.

Feedback: Our app was created using React.js, so it took us a good amount of time installing dependencies and reworking scripts to fit Story into our project - would love to see better react.js compatibility in the future. Additionally, the typescript_tutorial was extremely helpful in quickstarting our project.

## Othentic
Othentic was used to verify that each livestream is genuine by pushing the verified data onchain using EigenLayer's restaking security model.

Future:

Feedback:

## Targon
The Targon implementation allowed us to identify significant changes between frames and flag them in a consolidated surveillance report, allowing for users signed up for that camera to be notified of suspicious activity.

Future: While we already detect objects using bounding boxes, we would love to implement a "history of object" feature that tracks objects movement across frames and allow users to receive reports on specific objects over selected time periods.

Feedback: We initially wanted to use targon to run image analysis inference on the frames, but we had to pivot to using a different model (BLIP) to analyze the image and then convert it to text embeddings for targon to work with.

## U2U DePIN Network

Future:

Feedback:

# Installation
## React Web App

cd frontend

npm install --legacy-peer-deps

npm start

## Flask backend
cd backend

py flask_server.py

## Livestream

1. Run docker desktop

2. docker run --rm -it -p 8554:8554 aler9/rtsp-simple-server

3. #ffmpeg -re -stream_loop -1 -i {insert_mp4_file} -rtsp_transport tcp -c copy -f rtsp rtsp://localhost:8554/mystream

4. run python multi-stream.py
