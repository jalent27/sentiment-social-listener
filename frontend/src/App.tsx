import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useState} from "react";

function App() {
  const [data, setData] = useState(null);
  const [topic, setTopic] = useState("");

  async function getSentiment()
  {
    const response = await fetch(`http://127.0.0.1:8000/analyze/${topic}`)
    const result = await response.json();
    setData(result);
  }

  return (
    <div>
      <input
        value = {topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={getSentiment}>Get Sentiment</button>
      
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  )

}

export default App;
