import React, { useState, useEffect, use } from 'react';
import { motion } from "framer-motion";
import MapState from './MapState';

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
    setState('map');
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

    await fetch("/api/add_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: newCamUid,
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
      <>
        <div className="flex items-center justify-center h-screen bg-black text-white relative">
          {/* Add Camera Button */}
          <button
            onClick={() => setShowPopup(true)}
            className="absolute top-5 right-5 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-black font-semibold"
          >
            + Add Camera
          </button>

          {/* Original Homepage Content */}
          <div className="text-center">
            <h1 className="text-4xl font-light">
              find me <motion.span className="text-green-400 font-bold" animate={{ opacity: [0, 1], transition: { duration: 0.8 } }}>{options[index]}</motion.span>
            </h1>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              className="mt-6 p-3 w-80 text-black rounded-lg focus:outline-none"
              placeholder="Type your search..."
            />
            <button
              onClick={handleSubmit}
              className="ml-4 px-5 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-black font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {/* Add Camera Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Camera</h2>
              <input
                type="text"
                placeholder="Coordinates format: lat,long"
                value={newCamCoords}
                onChange={(e) => setNewCamCoords(e.target.value)}
                className="w-full p-2 mb-3 rounded bg-gray-800 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Stream URL"
                value={newCamUrl}
                onChange={(e) => setNewCamUrl(e.target.value)}
                className="w-full p-2 mb-3 rounded bg-gray-800 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCamDesc}
                onChange={(e) => setNewCamDesc(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-800 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Wallet Address (for rewards)"
                value={newCamDesc}
                onChange={(e) => setNewCamWalletID(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-800 text-white focus:outline-none"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewCamera}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };


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