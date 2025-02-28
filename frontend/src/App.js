import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
// import MapState from './MapState';
import './home.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CyberMap from './CyberMap';

import { custom, stringToHex } from 'viem';
import { useWalletClient } from "wagmi";
import { StoryClient, PIL_TYPE } from "@story-protocol/core-sdk";
import { LicenseTerms } from '@story-protocol/core-sdk';
import { zeroAddress, zeroHash } from 'viem'

import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import {
  createConfig,
  WagmiProvider,
  useAccount,
} from 'wagmi';
import { QueryClient, QueryClientProvider, infiniteQueryOptions } from '@tanstack/react-query';


const TerminalInput = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <div className="text-green-500 text-sm mb-1">{label}:</div>
    <div className="flex items-center">
      <span className="mr-2">{'>'}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent border-none focus:outline-none text-green-500 w-full caret-green-500"
      />
    </div>
  </div>
);


const bootSequence = [
  'INITIALIZING CYBER MAINFRAME...',
  'ACCESSING CORE MEMORY...',
  '                                                                                                                                                                  ',
  '                                                                                             +**+                                                                 ',
  '                                                                                             -++=                                                                 ',
  '                                                                                                            -++=++++=:                                            ',
  '                                                                                                            +++++++-=+++:                    -==-:                ',
  '         +*=           **:   =*+  ***++****+       :****++****+           =***+*+***=  +*-   :**              :--  -=++++++            =+++++++++++++=            ',
  '         +*=           **:   =*++*:       +**     **+.       -**=       -*++        =*=**-   :+*                  -+:  =+++++++===+++++++++++++++++++++=          ',
  '         ++=           +*:   =**=          *++   *+-          .**      =**-           *++-   :**                    .+=   +++++++++++++=.           +++++         ',
  '         +*=           **:   =+*           +*+                -+*      +*-             **-   :*+                       =+:     :::      -++=-:   -== =++++        ',
  '         +*=           *+:   =*+           =*+      :=+*****+***+      **:             **-   :*+                          :+++=----+++:             ++++:=.       ',
  '         ++=           **:   =*+           =*+    **+*-        **      *+:             +*-   :**                                                    +++= +        ',
  '         +*=           +*-   =*+           +*+   *+:          :+*      +*+            +*+-   :+*                                                :=++++= --        ',
  '         =*+          **+:   =*+           =*+  :**          :**+       **+          =**+-   :*+                                     .-++++++++++++=  :=.         ',
  '          ***-      +*+**:   =*+           =*+   +**-      -**-**-       +***=    -**+ **-   :**                                  -+++=            =++            ',
  '           -+****+**-  +*:   =*+           +*+    :+**+****+:  =****+      :+*****+:   +*-   :+*                                +-::+=---:--::-::                 ',
  '                                                                                      -**                                    .+=                                  ',
  '                                                                      **             .**-                                   :                                     ',
  '                                                                      =**+-        :***:                                                                          ',
  '                                                                        .+*****+***++:                                                                            ',
  '                                                                                                                                                                  ',


  'BIOS VERSION 0xDEADBEEF',
  'MEMORY TEST: 64K OK',
  'INITIALIZING HARDWARE RAID ARRAY...',
  'MOUNTING /dev/cyberpunk',
  'LOADING TOR PROTOCOL...',
  'ACTIVATING NEURAL NETWORK...',
  'ESTABLISHING QUANTUM ENCRYPTION...',
  'WARNING: SYSTEM INTRUSION DETECTED',
  'DEPLOYING COUNTERMEASURES...',
  'AUTHENTICATING... BIOMETRICS CONFIRMED'
];

// const bootSequence = [
//   'INITIALIZING CYBER MAINFRAME...',
//   'ACCESSING CORE MEMORY...',
//   '                                                                                                                                       ',
//   '008800000800      680888880800      800008            0088088880800      800    680085   3               00 308000                     ',
//   '000088008008      600000000800      808808              086      80       8   085    00                00008    000                    ',
//   '080000800088      608008008008      800008              00        0          708     608                888      083                   ',
//   '080800800800            800080      800800              08                   880     700                380      083                   ',
//   '080080080008            800800      800808              00                    08     083                300      003                   ',
//   '080080080080            800800      800008              08      68     8008   06886080      50068808    300      002                   ',
//   '080008008008            008000      000000              0000000000    0 303 60             00      806  880      086                   ',
//   '080800800808            800088008800                    00       8      00  000           080000000080  0805    2800                   ',
//   '080080080000            800800800008                    08             08    50880000080 200                                           ',
//   '080080080080            008000800808                    00             06    00       200608                                           ',
//   '080008008008            080080080000                    803        0  08  0 00         00 886                                          ',
//   '080800800800            800800080088                    000       00 00 58  886       08   008     80                                  ',
//   '080080080080            808088808800                  00000000000083 600     880080000      58008006                                   ',
//   '080080080080      000000                                                                                                               ',
//   '080008008008      088080                               0808                        0800     0088                                       ',
//   '080800800800      000080                                006                         805      00                                        ',
//   '080080080080      008000                                08                           88     08                                         ',
//   '080080080080      008008                                08                           800   38                                          ',
//   '080008008000      000880                                08              0880          805  8     00088        0  2806                  ',
//   '080800800800      080000                                08            88   008         80 03  08     088   0080 8  88                  ',
//   '080080080088000008008008000000000008                    80                  006         008  08       080    888                       ',
//   '080080080000880800800800880880880800                    08                  600         08  5080000000000    00                        ',
//   '080008008800000800800800000000000800                    08                08080         0   080              00                        ',
//   '080800800088008008008008008008008008                    00         0  580   600        0    600              08                        ',
//   '080080080000800080080080080080080080                    802       60 600    880       0      808       02    00                        ',
//   '080080880800800800800880080080080080                   0800     8000  000200 080  0008        008000880     2808                       ',
//   '                                                                                                                                       ',
//   'BIOS VERSION 0xDEADBEEF',
//   'MEMORY TEST: 64K OK',
//   'INITIALIZING HARDWARE RAID ARRAY...',
//   'MOUNTING /dev/cyberpunk',
//   'LOADING TOR PROTOCOL...',
//   'ACTIVATING NEURAL NETWORK...',
//   'ESTABLISHING QUANTUM ENCRYPTION...',
//   'WARNING: SYSTEM INTRUSION DETECTED',
//   'DEPLOYING COUNTERMEASURES...',
//   'AUTHENTICATING... BIOMETRICS CONFIRMED'
// ];

function App() {
  const terminalEndRef = useRef(null);
  const [state, setState] = useState('home');
  const [query, setQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newCamCoords, setNewCamCoords] = useState("");
  const [newCamUrl, setNewCamUrl] = useState("");
  const [newCamDesc, setNewCamDesc] = useState("");
  const [query_found_cam, set_query_found_cam] = useState();
  const [query_found_res, set_query_found_res] = useState();
  const [allCams, setAllCams] = useState([]);
  const [currentBootStep, setCurrentBootStep] = useState(0);


  //email updates part
  const [showUpdatesPopup, SetshowUpdatesPopup] = useState(false);
  const [newCamEmail, setNewCamEmail] = useState("");
  const [newCamID, setNewCamID] = useState("");

  const { data: wallet } = useWalletClient();
  async function setupStoryClient() {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    return StoryClient.newClient({
      account: wallet.account,
      transport: custom(wallet.transport),
      chainId: "aeneid", // Replace with your actual chain ID
    });
  }
  async function registerIpWithRoyalties(image_url, camDesc) {
    try {
      const client = await setupStoryClient();

      // PIL Terms configuration for royalties
      const commercialRemixTerms = {
        transferable: true,
        royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // RoyaltyPolicyLAP address from https://docs.story.foundation/docs/deployed-smart-contracts
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 50, // can claim 50% of derivative revenue
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: '0x1514000000000000000000000000000000000000', // $WIP address from https://docs.story.foundation/docs/deployed-smart-contracts
        uri: '',
      }
      const licensingConfig = {
        isSet: false,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroHash,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: zeroAddress,
      };

      const ipMetaData_temp =
      {
        image: image_url,
        mediaType: 'image/jpeg',
        title: 'CAM-NETWORK-IP',
        description: camDesc,
        ipMetadataURI: 'test-uri',
        ipMetadataHash: stringToHex('test-metadata-hash', { size: 32 }),
        nftMetadataHash: stringToHex('test-nft-metadata-hash', { size: 32 }),
        nftMetadataURI: 'test-nft-uri',
      }

      console.log("IP METADATA", ipMetaData_temp)

      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
        licenseTermsData: [{ terms: commercialRemixTerms, licensingConfig }], // IP already has non-commercial social remixing terms. You can add more here.
        // set to true to mint ip with same nft metadata
        allowDuplicates: true,
        // https://docs.story.foundation/docs/ip-asset#adding-nft--ip-metadata-to-ip-asset
        ipMetadata: ipMetaData_temp,

        txOptions: { waitForTransaction: true },
      })

      console.log("res ", response)
      var lisenceTermsId = response.licenseTermsIds[0]

      console.log(`Transaction hash: ${response.txHash}, 
                   Token ID: ${response.tokenId}, 
                   IPA ID: ${response.ipId}`);


      const lisenceTokensMint = await client.license.mintLicenseTokens({
        licenseTermsId: lisenceTermsId,
        licensorIpId: response.ipId,
        amount: 1,
        maxMintingFee: 0n, // disabled
        maxRevenueShare: 100, // default
        txOptions: { waitForTransaction: true }
      });


      console.log(`Transaction hash of minting lisence tokens: ${lisenceTokensMint.txHash}, 
                   Token ID: ${lisenceTokensMint.tokenId}, 
                   IPA ID: ${lisenceTokensMint.ipId}`);


      return {
        "txHash": response.txHash,
        "tokenId": response.tokenId,
        "ipId": response.ipId,
      }

    } catch (error) {
      console.error("Error registering IP with royalties:", error);
    }
  }
  ///MAP STUFF
  /// Modified MAP STUFF
  const [selectedCam, setSelectedCam] = useState(null);

  ///END MAP STUFF

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bootSequence, showPopup]);

  useEffect(() => {
    if (state === 'home') {
      const timer = setInterval(() => {
        setCurrentBootStep(prev => Math.min(prev + 1, bootSequence.length));
      }, 5);
      return () => clearInterval(timer);
    }

  }, [state]);


  //load data forr map
  useEffect(() => {
    const fetchData = async () => {
      console.log('trying to fetch cam data')
      try {
        const response = await fetch('/api/get_all_cameras', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log("ALL CAMERAS DATA:", data);
        setAllCams(data);
      } catch (error) {
        console.error("Error fetching camera data:", error);
      }
    }

    fetchData();
    // setState('map');
  }, []);

  useEffect(() => {
    if (state === 'loading') {
      const timer = setTimeout(() => {
        console.log("Delayed action executed");
        setState('map');
      }, 3000);
      return () => clearTimeout(timer);
    }

    // if (state === 'map') {
    //   //we just swtiched to map stat
    //   console.log("query found cam", query_found_cam);
    //   console.log(" flying to location" + query_found_cam.location);
    //   if (query_found_cam) {
    //     const [lat, lng] = query_found_cam.location.split(',').map(Number);
    //     flyToLocation([lat, lng]);

    //     setSelectedCam(query_found_cam);
    //   }
    // }
  }, [state]);


  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };


  const handleSubmit = async (event) => {

    if (query === '') {
      return;
    }

    console.log('Query:', query);

    const response = await fetch('/api/query_determine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query })
    });

    const data = await response.json();

    const location = data.location;
    const face_search = data.face_search;

    if (location == -1) {
      console.log("Location not found");
      //now we need to search by description
      var cam = await searchByDescription(query, face_search);
      console.log("FOUND QUERY FOUND CAM PRE: ", cam)
      set_query_found_cam(cam);
      setSelectedCam(cam);
    }
    else {
      var cam = await searchByLocation(location, face_search, query);
      console.log("FOUND QUERY FOUND CAM PRE: ", cam)
      set_query_found_cam(cam);
      setSelectedCam(cam);
      console.log("cam location found at: ID ", cam);
    }

    setState('loading')
    console.log("COMPLETLY DONE DATA BELOW " + query_found_cam + "  " + query_found_res)

    console.log(data);

  };

  const searchByDescription = async (query, face_search) => {
    console.log('Query:', query);

    const response = await fetch('/api/search_cameras_description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    });

    const data = await response.json();
    console.log("WE NEED FACE SEARCH?" + face_search + "FULL DATA:", data)
    if (face_search) {
      var res = await face_search_frontend(data);
      set_query_found_res(res);
      console.log("We found a res ", res)
    }
    else {

      set_query_found_res("")
      // FOR NOW NO FACE SEARCH IS DISABLE

      // var res = answer_query_no_face_search(data, query);
      // set_query_found_res(res);
    }

    setState('loading')
    console.log("COMPLETLY DONE DATA BELOW " + query_found_cam + "  " + query_found_res)


    return data;
  }

  const searchByLocation = async (location, face_search, query) => {
    console.log('Location:', location);

    const response = await fetch('/api/search_cameras_location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: String(location) })
    });

    const data = await response.json();
    console.log("WE NEED FACE SEARCH?" + face_search + "FULL DATA:", data)
    if (face_search) {
      var res = await face_search_frontend(data);
      set_query_found_res(res);
      console.log("We found a res ", res)
    }
    else {
      set_query_found_res("")

      // FOR NOW NO FACE SEARCH IS DISABLED

      // var res = answer_query_no_face_search(data, query);
      // set_query_found_res(res);
    }

    return data
  }

  const face_search_frontend = async (cam) => {
    //replace with logic that queries agent and then gets camera image and then gets face

    console.log("STARTING FACE SEARCH FRONTEND");
    console.log("cam url", cam['image_url']);

    const response = await fetch('/api/answer_query_face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "cam_url": cam['image_url'] })
    });

    var data = await response.json();

    console.log("RESPONSE DATA:", data);

    return data.response;

    return {
      "name": "John Doe",
      "age": "25",
      "facebook": "https://www.facebook.com",
      "linkedin": "https://www.linkedin.com",
    }

  }
  const answer_query_no_face_search = async (cam, prompt) => {
    console.log("STARTING ANSWER QUERY NO FACE SEARCH");
    console.log("CAM DATA:", cam);
    console.log("PROMPT:", prompt);

    if (!cam || !prompt) {
      console.error("ERROR: cam or prompt is undefined");
      return { error: "Invalid input data" };
    }

    try {
      const response = await fetch('/api/answer_query_no_face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cam: cam, prompt: prompt })
      });

      const data = await response.json();

      console.log("RESPONSE DATA:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return { error: "Request failed" };
    }
  };

  const verify_camera_avs = async (image_url) => {

    //fetch http://localhost:4003/task/execute

    const response = await fetch('http://localhost:4003/task/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "image_url": image_url })
    });

    const data = await response.json();

    console.log(data)

    return data

  }


  const addNewCamera = async () => {


    //verify camera legitness using othentic avs
    // const verified_cam_data = await verify_camera_avs(newCamUrl)
    // console.log("VERIFIED CAM ON CHAIN ", verified_cam_data)

    // do story protocol
    var data = await registerIpWithRoyalties(newCamUrl, newCamDesc);
    console.log("registered data  = ", data)
    console.log("registered data ", data.txHash, data.tokenId, data.ipId)

    const newCamUid = Math.floor(Math.random() * 1000000);

    console.log("Adding new camera:", newCamUid, newCamCoords, newCamUrl, newCamDesc);

    await fetch("/api/add_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: String(newCamUid),
        location: newCamCoords,
        image_url: newCamUrl,
        description: newCamDesc,
        txHash: data.txHash,
        ipId: data.ipId,
        tokenId: Number(data.tokenId)
        // txHash: 1,
        // ipId: 2,
        // tokenId: 3
      }),
    });
    setShowPopup(false);
  };

  const addNewEmailUpdate = async () => {
    console.log("Adding new email update:", newCamID, newCamEmail);

    await fetch("/api/add_email_update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        camID: newCamID,
        email: newCamEmail,
      }),
    });

    SetshowUpdatesPopup(false);
  }

  // return (
  //   <div>

  //     <DynamicWidget />
  //     <TestComponent />

  //   </div>
  // )
  if (state === 'home' || state === 'loading') {
    return (
      <div className="h-screen bg-black overflow-hidden font-mono">
        <div className="crt-screen fixed inset-0 pointer-events-none"></div>

        <div className='bg-black'>
          <DynamicWidget />
        </div>

        <div className="relative h-full text-green-500 p-8 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {bootSequence.slice(0, currentBootStep).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`text-xs ${idx >= 2 && idx <= 30 ? 'text-green-500 whitespace-pre' : 'text-green-500'}`}
            >
              {typeof line === 'string' ? line : line}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: bootSequence.length * 0.235 }}
          >


            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8"
            >


              <div className="flex items-center text-3xl">
                <span className="mr-2">{'>'}</span>
                {!query && <span className="animate-blink">▌</span>}
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-transparent border-none focus:outline-none text-green-500 caret-green-500 placeholder-gray-500"
                  placeholder="ENTER SEARCH PARAMETERS..."
                />
              </div>
            </motion.div>
          </motion.div>

          <div className='absolute top-4 right-4'>
            <button
              onClick={() => setShowPopup(true)}
              className=" text-green-500 hover:text-green-400 underline underline-offset-4 decoration-dashed"
            >
              [INIT-CAMERA-PROTOCOL]
            </button>
            <button
              onClick={() => setState("map")}
              className=" text-green-500 hover:text-green-400 underline underline-offset-4 decoration-dashed"
            >
              [OPEN-MAP]
            </button>
            <button
              onClick={() => SetshowUpdatesPopup(true)}
              className=" text-green-500 hover:text-green-400 underline underline-offset-4 decoration-dashed"
            >
              [GET-UPDATES]
            </button>
          </div>




          {showPopup && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-black p-8 border-2 border-green-500 w-[500px] shadow-glow">
                <div className="text-lg mb-4">[CAMERA CONFIGURATION]</div>
                <TerminalInput
                  label="COORDINATES"
                  value={newCamCoords}
                  onChange={(e) => setNewCamCoords(e.target.value)}
                  placeholder="FORMAT: XX.XXXX,YY.YYYY"
                />
                <TerminalInput
                  label="STREAM URL"
                  value={newCamUrl}
                  onChange={(e) => setNewCamUrl(e.target.value)}
                />
                <TerminalInput
                  label="DESCRIPTION"
                  value={newCamDesc}
                  onChange={(e) => setNewCamDesc(e.target.value)}
                />

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-red-500 hover:text-red-400 border border-red-500 px-4 py-2"
                  >
                    [ABORT]
                  </button>
                  <button
                    onClick={addNewCamera}
                    className="text-green-500 hover:text-green-400 border border-green-500 px-4 py-2"
                  >
                    [COMMIT]
                  </button>
                </div>
              </div>
            </div>
          )}

          {showUpdatesPopup && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-black p-8 border-2 border-green-500 w-[500px] shadow-glow">
                <div className="text-lg mb-4">[GET UPDATES]</div>
                <TerminalInput
                  label="CAM-ID"
                  value={newCamID}
                  onChange={(e) => setNewCamID(e.target.value)}
                />
                <TerminalInput
                  label="EMAIL TO RECIEVE UPDATES"
                  value={newCamEmail}
                  onChange={(e) => setNewCamEmail(e.target.value)}
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => SetshowUpdatesPopup(false)}
                    className="text-red-500 hover:text-red-400 border border-red-500 px-4 py-2"
                  >
                    [ABORT]
                  </button>
                  <button
                    onClick={addNewEmailUpdate}
                    className="text-green-500 hover:text-green-400 border border-green-500 px-4 py-2"
                  >
                    [COMMIT]
                  </button>
                </div>
              </div>
            </div>
          )}

          {state === 'loading' && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-black p-8 border-2 border-green-500 w-[500px] shadow-glow">
                <div className="text-lg mb-4">[INITIALIZING CAMERA PROTOCOL]</div>

                {/* Loading status lines */}
                <div className="space-y-4 text-green-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span>Finding relevant cameras....</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span>Querying camera vectors....</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span>Augmenting query response...</span>
                  </div>
                </div>

                <div className="mt-6 text-xs text-green-500/80">
                  System Status: Initializing neural network overlay...
                </div>
              </div>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>
    );
  }

  if (state === 'map') {
    return (

      <CyberMap
        allCams={allCams}
        query_found_res={query_found_res}
        query_found_cam={query_found_cam || null}
      />

    )
  }
}

export default App;