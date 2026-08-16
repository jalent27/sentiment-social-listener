import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useState} from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, RadialBarChart, RadialBar } from "recharts";

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

          <h1>Sentiment Distribution</h1>
          <PieChart width={400} height={400}>
            <Pie
              data={data.sentiment_breakdown}
              dataKey = "value"
              nameKey = "name"
              cx = "50%"
              cy = "50%"
              outerRadius={100}
              label
            >
              <Cell fill="#4caf50" />
              <Cell fill="#8f9198" />
              <Cell fill="#e83838" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>

          <h1>Articles vs. Comments</h1>
          <div style={{ display: "flex", gap: "60px", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <RadialBarChart
                width={150}
                height={150}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={10}
                data={[{ value: (data.sentiment_comparison.articles_avg + 1) * 50, fill: "#4caf50" }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" background cornerRadius={10} />
              </RadialBarChart>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                  {((data.sentiment_comparison.articles_avg + 1) * 50).toFixed(1)}
                </div>
                <div style={{ fontSize: "12px" }}>Articles</div>
              </div>
            </div>

            <div style={{ position: "relative", width: 150, height: 150 }}>
              <RadialBarChart
                width={150}
                height={150}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={10}
                data={[{ value: (data.sentiment_comparison.comments_avg + 1) * 50, fill: "#2196f3" }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" background cornerRadius={10} />
              </RadialBarChart>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                  {(data.sentiment_comparison.comments_avg * 50).toFixed(1)}
                </div>
                <div style={{ fontSize: "12px" }}>Comments</div>
              </div>
            </div>
          </div>

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
