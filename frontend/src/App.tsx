import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useState} from "react";

function App() {
  const [data, setData] = useState<any>(null);
  const [topic, setTopic] = useState("");

  async function getSentiment()
  {
    const response = await fetch(`http://127.0.0.1:8000/analyze/${topic}`)
    const result = await response.json();
    setData(result);
    console.log(result);
  }



  return (
    <div>
      <input
        value = {topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={getSentiment}>Get Sentiment</button>
      
      {data && (
        <div>
          <h2>Articles</h2>
          {data.articles.map((article : any) => (
            <p key={article.url}>{article.title} - Score: {article.sentiment_score}</p>
          ))}
        </div>
      )}

    </div>
  )
}

export default App;
