import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
// import MapState from './MapState';
import './home.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CyberMap from './CyberMap';


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

function App() {
  const terminalEndRef = useRef(null);
  const [state, setState] = useState('home');
  const [query, setQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newCamCoords, setNewCamCoords] = useState("");
  const [newCamUrl, setNewCamUrl] = useState("");
  const [newCamDesc, setNewCamDesc] = useState("");
  const [newCamWalletID, setNewCamWalletID] = useState("");
  const [query_found_cam, set_query_found_cam] = useState();
  const [query_found_res, set_query_found_res] = useState();
  const [allCams, setAllCams] = useState([]);
  const [currentBootStep, setCurrentBootStep] = useState(0);



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

  const addNewCamera = async () => {
    const newCamUid = Math.floor(Math.random() * 1000000);

    console.log("Adding new camera:", newCamUid, newCamCoords, newCamUrl, newCamDesc, newCamWalletID);

    await fetch("/api/add_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: String(newCamUid),
        location: newCamCoords,
        image_url: newCamUrl,
        description: newCamDesc,
        walletID: newCamWalletID,
        
      }),
    });
    setShowPopup(false);
  };

  if (state === 'home' || state === 'loading') {
    return (
      <div className="h-screen bg-black overflow-hidden font-mono">
        <div className="crt-screen fixed inset-0 pointer-events-none"></div>

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
            transition={{ delay: bootSequence.length * 0.143 }}
          >


            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8"
            >
              <div className="text-2xl mb-6">
                MAINFRAME ACCESS GRANTED
              </div>

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
                <TerminalInput
                  label="WALLET ADDRESS"
                  value={newCamWalletID}
                  onChange={(e) => setNewCamWalletID(e.target.value)}
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