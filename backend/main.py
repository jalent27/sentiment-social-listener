from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI()

app.add_middleware(
    #CORSMiddleware is used to allow requests from the frontend (React) to the backend (FastAPI) without any CORS issues.
    # it allows requests from the specified origin (http://localhost:3000)... which is the frontend
    # and allows all methods and headers.
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze/{topic}")
#calls this function when the user navigates to /analyze/{topic} in the browser
def analyze_topic(topic: str):
    news_data = fetch_news(topic)
    youtube_data = fetch_youtube_data(topic)
    article_sentiment = analyze_articles_sentiment(news_data["articles"])
    comments_sentiment = analyze_comments_sentiment(youtube_data)

    return {
    "topic": topic,
    "articles": article_sentiment,
    "youtube_comments": comments_sentiment
}
load_dotenv() # Loads the environment variables such as API keys from the .env file
news_api_key = os.getenv("NEWS_API_KEY")
youtube_api_key = os.getenv("YOUTUBE_API_KEY")
#creating api variables to store the api keys from the .env file

def fetch_news(topic):
    url = f"https://newsapi.org/v2/everything?q={topic}&apiKey={news_api_key}" #url of newsapi for a specific topic
    response = requests.get(url) #gets the data from that url
    return response.json() #returns the data in json format

def search_videos(topic):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={topic}&type=video&maxResults=5&key={youtube_api_key}"
    #url of youtube video search results for specified topic. maxResults is set to 5 for now but that can be changed
    response = requests.get(url)
    return response.json()

def search_yt_comments(video_id):
    url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=20&key={youtube_api_key}"
    #url of the youtube comments data for the specified video id. Max comments is set to 20 for now but that can be changed
    response = requests.get(url)
    return response.json()

def fetch_comments(video_id):
    comments_data = search_yt_comments(video_id)
    #print(comments_data)
    comments = []
    for comment in comments_data["items"]:
        comments.append(comment["snippet"]["topLevelComment"]["snippet"]["textOriginal"]) 
        #storing comments of a specified video in a list. The comments are stored in the "textOriginal" field of the 
        #"topLevelComment" object in the "snippet" object of each comment item.

    return comments

def fetch_youtube_data(topic): #ties together search_videos and fetch_comments
    video_results = search_videos(topic)
    all_comments = []
    for item in video_results["items"]:
        video_id = item["id"]["videoId"]
        all_comments.extend(fetch_comments(video_id)) #creating master list of all comments from all videos for a topic

    return all_comments

#print(fetch_youtube_data("Lebron")) test

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    result = analyzer.polarity_scores(text)
    return result["compound"] #returns the compound score which summarizes overall sentiment

#print(analyze_sentiment("I love kyrie irving hes good at basketball"))

def analyze_comments_sentiment(comments):
    scored_comments = []
    for comment in comments:
        score = analyze_sentiment(comment)
        #creating a list of dictionaries where each dictionary contains a comment and its sentiment score
        scored_comments.append({"comment": comment, "score": score})

    return scored_comments

def analyze_articles_sentiment(articles):
    for article in articles:
        combined_text = article['title'] + ". " + article['description'] #combined article title and description so I can compute one combined sentiment sore
        score = analyze_sentiment(combined_text)
        article["sentiment_score"] = score #adding a new key-value pair so we can keep other useful information in the dictonary

    return articles


