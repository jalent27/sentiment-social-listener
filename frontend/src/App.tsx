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
          <h1>Overall Sentiment: {data.overall_sentiment} Score: {data.sentiment_score}</h1>
          <h1>Sentiment Distribution - Positive: {data.positive_count}, Neutral: {data.neutral_count}, Negative: {data.negative_count}</h1>
          <h1>Articles</h1>
          {data.articles.map((article : any) => (
            <p key={article.url}>{article.title} - Score: {article.sentiment_score}</p>
          ))}

          <h1>Youtube Comments</h1>
          {data.youtube_comments.map((yt_comment: any, index: number) => (
          <p key={index}>{yt_comment.comment} - Score: {yt_comment.score}</p>
        ))}
        </div>
      )}

    </div>
  )
}

export default App;
