import React from 'react';
import './App.css';
import {useState} from "react";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend, RadialBarChart, RadialBar } from "recharts";

function App() {
  const [data, setData] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [loading, setIsLoading] = useState(false);

  async function getSentiment()
  {
    setIsLoading(true);
    const response = await fetch(`http://127.0.0.1:8000/analyze/${topic}`)
    const result = await response.json();
    setData(result);
    setIsLoading(false);
    console.log(result);
  }

  function getSentimentColor(score: number) {
    if (score > 0.05) {
      return "#2d8d32";
    }
    else if (score < -0.05) {
      return "#b52525";
    }
    else {
      return "#444343";
    }
  }

  return (
    <div className="app-container">
      <h1 className="app-title">SOCIAL SENTIMENT ANALYZER</h1>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search a topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className="search-button" onClick={getSentiment}>➤</button>
      </div>

      {loading && <div className="loading-text">
        <div className="spinner"></div>
        <p>Analyzing sentiment...</p>
      </div>}

      {data && (
        <>
          <div className="section bubble-row">
            <div className="score-bubble-wrap">
              <div className="score-bubble">
                {((data.sentiment_score + 1) * 50).toFixed(1)}
              </div>
              <div className="score-label">Overall Sentiment Score (0–100)</div>
            </div>

            <div className="speech-bubble">
              The sentiment of this topic was <strong>{data.overall_sentiment}</strong>. {data.ai_summary}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Sentiment Distribution</div>
            <div className="card-row">
              <div className="card">
                <PieChart width={400} height={400}>
                  <Pie
                    data={data.sentiment_breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
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
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Articles vs. Comments</div>
            <div className="bubble-row">
              <div className="score-bubble-wrap">
                <div className="score-bubble" style={{ borderColor: "#4caf50" }}>
                  {((data.sentiment_comparison.articles_avg + 1) * 50).toFixed(1)}
                </div>
                <div className="score-label">Articles Sentiment Score (0–100)</div>
              </div>
              <div className="score-bubble-wrap">
                <div className="score-bubble" style={{ borderColor: "#2196f3" }}>
                  {((data.sentiment_comparison.comments_avg + 1) * 50).toFixed(1)}
                </div>
                <div className="score-label">Comments Sentiment Score (0–100)</div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Histogram Distribution</div>
            <div className="card-row">
              <div className="card">
                <BarChart width={350} height={250} data={data.histogram_data_articles}>
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Bar dataKey="count" fill="#4caf50" />
                  <Tooltip />
                </BarChart>
              </div>
              <div className="card">
                <BarChart width={350} height={250} data={data.histogram_data_comments}>
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Bar dataKey="count" fill="#2196f3" />
                  <Tooltip />
                </BarChart>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Highest &amp; Lowest Sentiment Articles</div>
            <div className="card-row">
              <div className="card">
                <h3>Top 3 Highest</h3>
                {data.highest_articles.map((article: any) => (
                  <p key={article.url}>{article.title} - Score: {article.sentiment_score}</p>
                ))}
              </div>
              <div className="card">
                <h3>Top 3 Lowest</h3>
                {data.lowest_articles.map((article: any) => (
                  <p key={article.url}>{article.title} - Score: {article.sentiment_score}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Highest &amp; Lowest Sentiment Comments</div>
            <div className="card-row">
              <div className="card">
                <h3>Top 3 Positive</h3>
                {data.highest_comments.map((comment: any, index: number) => (
                  <p key={index}>{comment.comment} - Score: {comment.score}</p>
                ))}
              </div>
              <div className="card">
                <h3>Top 3 Negative</h3>
                {data.lowest_comments.map((comment: any, index: number) => (
                  <p key={index}>{comment.comment} - Score: {comment.score}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">All Articles</div>
            <div className="card">
              {data.articles.map((article: any) => (
                <p key={article.url} style= {{color: getSentimentColor(article.sentiment_score) }}>
                  {article.title} - Score: {article.sentiment_score}</p>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">All YouTube Comments</div>
            <div className="card">
              {data.youtube_comments.map((yt_comment: any, index: number) => (
                <p key={index} style= {{color: getSentimentColor(yt_comment.score) }}>
                  {yt_comment.comment} - Score: {yt_comment.score}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App;