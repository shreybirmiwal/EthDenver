import React, { useState, useEffect, use } from 'react';
import { motion } from "framer-motion";
import MapState from './MapState';
import './home.css'


const bootSequence = [
  'INITIALIZING MAINFRAME OS...',
  'MOUNTING /dev/sda1... OK',
  'LOADING CRYPTO MODULES... OK',
  'CHECKING NETWORK INTERFACES... OK',
  'STARTING SSH DAEMON... OK',
  'ESTABLISHING QUANTUM LINK... CONNECTED',
  'WARNING: SYSTEM PROBES DETECTED',
  'AUTHENTICATING USER... BIOMETRICS CONFIRMED'
]

function App() {

  const [state, setState] = useState('home');

  //Home page
  const [query, setQuery] = useState('');
  const options = ["my lost dog", "the prison escapee", "my stolen car"];
  const [index, setIndex] = useState(0);

  //add new camera
  const [showPopup, setShowPopup] = useState(false);
  const [newCamCoords, setNewCamCoords] = useState("");
  const [newCamUrl, setNewCamUrl] = useState("");
  const [newCamDesc, setNewCamDesc] = useState("");
  const [newCamWalletID, setNewCamWalletID] = useState("");
  //END add new camera

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);




  //Map page
  const [query_found_cam, set_query_found_cam] = useState();
  const [query_found_res, set_query_found_res] = useState();
  const [allCams, setAllCams] = useState([]);


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
      var cam = searchByDescription(query, face_search);
      set_query_found_cam(cam);
    }
    else {
      var cam = searchByLocation(location, face_search, query);
      set_query_found_cam(cam);
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
      var res = face_search_frontend(data);
      set_query_found_res(res);
    }
    else {
      var res = answer_query_no_face_search(data, query);
      set_query_found_res(res);
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
      var res = face_search_frontend(data);
      set_query_found_res(res);
    }
    else {
      var res = answer_query_no_face_search(data, query);
      set_query_found_res(res);
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
        {/* CRT Screen Effect */}
        <div className="crt-screen fixed inset-0 pointer-events-none"></div>

        <div className="relative h-full text-green-500 p-8">
          {/* Boot Sequence Animation */}
          {bootSequence.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.3 }}
              className="text-sm mb-1"
            >
              {line}
            </motion.div>
          ))}

          {/* SSH Login Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: bootSequence.length * 0.3 }}
          >
            <div className="mt-4">
              <span className="text-green-400">ssh user@mainframe</span>
            </div>

            {/* Main Interface */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8"
            >
              <div className="text-2xl mb-6 glitch" data-text="">
                MAINFRAME ACCESS GRANTED
              </div>

              <div className="flex items-center">
                <span className="mr-2">{'>'}</span>
                {query === '' ? (
                  <span className="animate-blink">▌</span>
                ) : (

                  <span className="animate-blink"></span>
                )}

                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-96 bg-transparent border-none focus:outline-none text-green-500 caret-green-500 placeholder-gray-500"
                  placeholder="ENTER SEARCH PARAMETERS..."
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Add Camera Button */}
          <button
            onClick={() => setShowPopup(true)}
            className="absolute top-4 right-4 text-green-500 hover:text-green-400 underline underline-offset-4 decoration-dashed"
          >
            [INIT-CAMERA-PROTOCOL]
          </button>
        </div>

        {/* Add Camera Popup - Terminal Style */}
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
      </div>
    );
  }

  // TerminalInput component
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


  if (state === 'map') {
    return (
      <MapState
        allCams={allCams}
        queryFoundCam={query_found_cam}
      />
    );
  }
}


export default App;





// API TESTING
// const [data, setData] = useState('');
// useEffect(() => {
//   fetch('/api/hello-world')
//     .then(response => response.text())
//     .then(data => setData(data))
//     .catch(error => console.log(error));
// }, []);