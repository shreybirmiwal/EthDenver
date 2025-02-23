import React, { useState, useEffect } from 'react';

function App() {
  const [state, setState] = useState('home');

  //Home page
  const [query, setQuery] = useState('');
  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Query:', query);


    const response = await fetch('/api/query_determine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query })
    });

    const data = await response.json();
    console.log(data);

  };


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