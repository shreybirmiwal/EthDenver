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
[[Unagi Demo](https://youtu.be/hlyd5wbxtxc)


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

- The query found a camera on mainstage ethDenver and found the founder of EigenLayer
- You can see details about the person found in the image
- You can pay royalty or dispute the IP of the image (say if someone is using your camera footage or using illegal footage location)
- You can run agentic actions, like automatically create on-chain insurance claims (if this was a camera pointed at a burglarly or car crash etc)
<img width="961" alt="Screenshot 2025-02-27 at 10 07 27 PM" src="https://github.com/user-attachments/assets/b88035fb-b06d-41fe-9963-401e9f01a47a" />

   
Due to processing constraints, a script snapshots the camera livestreams, and uploads every 30th frame as the image.

# Future Work

### 1. Privacy Issues
- We hope to implement ZK proofs to gate access to cameras: You can only access the camera ONCE you show a ZK proof of a polic report that your car was robbed
- Token gate to only private markets (a museum could use our software, governments)

### 2. Verification of camera footage
- Camera footage currently is detected as deepfake through the AVS and verified off-chain.
- We hope to make it such that each camera is required to plug in a TEE (trusted execution environment) that attests to the footage as being real. The executioners and validators in the AVS would check the attestation off chain and bring the verification of the cams onchain

# Integrations
If you were a sponsor and wanted to see how we used your integration in our project, see below.

### Autonome
Autonome acts as our agent hosting layer. We use agentic actions in our platform to do things like 'automatically create insurance claims' based on camera footage on chain.

We had Autonome host our Coinbase Developer Platform (CDP) agentKit agent. After deploying this agent, we called the Autonome API and prompted our agent to mint an NFT that acts as an insurance claim.

Future: One future implementation would be to deploy our own agent framework that does CDP SDK + AgentKit, which would allow us to execute smart contracts that would be more specific to the needs, such as querying onchain insurance providers.

Feedback: Hyperbolic agent had some issues working until the dev team launched a v2. Implementing autonome into our code was also quite challenging, as the curl commands weren't working. However the support from the team was very helpful and fast!

## Story Protocol
Story Protocol was crucial in creating the incentive structure for camera providers. When a provider uploads their live stream, our application mints the imageURL as an NFT and registers it as an IPA. The camera provider is then paid a royalty every time a user queries that camera, incentivizing providers to be a part of the network.
People can also dispute cameras, "this is stolen footage"!

Future: We want to be able to have the frames collected by the camera to be put into a collection, giving users the ability to see previous significant frames queried by users.

Feedback: Our app was created using React.js, so it took us a good amount of time to install dependencies and rework scripts to fit Story into our project - we would love to see better React.js compatibility in the future. Additionally, the typescript_tutorial was extremely helpful in quickstarting our project.

## Othentic
Othentic was used to verify that each livestream is genuine by pushing the verified data onchain using EigenLayer's restaking security model.
For each camera that is uploaded to our network, executioners and validators (off-chain) run a API for deepfake detection so that onchain we know the camera is verified.

Future: We want to use TEEs on each camera to verify 'legitness' and then get validators/executioners to check the attestation of the TEE off chain.

Feedback: The docker compose was very helpful and made it easy to add and pass data in. We'd love to see more documentation on getting the final data answer from pinata.

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
