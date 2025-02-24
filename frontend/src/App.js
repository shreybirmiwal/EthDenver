import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

function App() {
  const [state, setState] = useState('home');

  //Home page
  const [query, setQuery] = useState('');
  const options = ["my lost dog", "the prison escapee", "my stolen car"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  //Map page
  const [query_found_cam, set_query_found_cam] = useState();
  const [query_found_res, set_query_found_res] = useState();

  useEffect(() => {
    if (state === 'loading') {
      const timer = setTimeout(() => {
        console.log("Delayed action executed");
        setState('map');
      }, 5000);
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


  if (state === 'home') {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
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
    );
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 backdrop-blur-lg z-50 bg-black">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 p-8 rounded-2xl shadow-2xl w-96 border border-gray-700">
          <div className="space-y-6">
            {/* Loading Item 1 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-green-500 rounded-full animate-spin border-t-transparent" />
                <span className="text-white/90 font-light">Determining search parameters...</span>
              </div>
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-green-500 animate-progress" />
              </div>
            </div>

            {/* Loading Item 2 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-green-500 rounded-full animate-spin border-t-transparent" />
                <span className="text-white/90 font-light">Querying relevant cameras...</span>
              </div>
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-green-500 animate-progress delay-100" />
              </div>
            </div>

            {/* Loading Item 3 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-green-500 rounded-full animate-spin border-t-transparent" />
                <span className="text-white/90 font-light">Analyzing live streams...</span>
              </div>
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-green-500 animate-progress delay-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'map') {
    return (
      <div>
        <h1>Map</h1>
      </div>
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