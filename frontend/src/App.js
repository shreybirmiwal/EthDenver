import React, { useState, useEffect } from 'react';

function App() {
  const [state, setState] = useState('home');

  //Home page
  const [query, setQuery] = useState('');
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
      searchByDescription(query, face_search);
    }
    else {
      searchByLocation(location, face_search);
      console.log("cam location found at: ID ", location);
    }

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
      face_search_frontend(data);
    }
    else {
      answer_query_no_face_search(data);
    }
  }

  const searchByLocation = async (location, face_search) => {
    console.log('Location:', location);

    const response = await fetch('/api/search_cameras_location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: location })
    });

    const data = await response.json();
    console.log("WE NEED FACE SEARCH?" + face_search + "FULL DATA:", data)
    if (face_search) {
      face_search_frontend(data);
    }
    else {
      answer_query_no_face_search(data);
    }
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
  const answer_query_no_face_search = async (cam) => {

  }


  if (state === 'home') {
    return (
      <div>
        <h1>Home</h1>
        <input value={query} onChange={handleQueryChange} />
        <button onClick={handleSubmit}>Submit</button>
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