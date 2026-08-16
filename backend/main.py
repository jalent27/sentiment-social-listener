from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from supabase import create_client

load_dotenv() # Loads the environment variables such as API keys from the .env file
news_api_key = os.getenv("NEWS_API_KEY")
youtube_api_key = os.getenv("YOUTUBE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
#creating api variables to store the api keys from the .env file

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

    #saving all the articles and comments to the supabase database
    for article in article_sentiment:
        save_to_supabase(topic, article['combined_text'], article["sentiment_score"])
    for comments in comments_sentiment:
        save_to_supabase(topic, comments["comment"], comments["score"])

    sentiment_label, sentiment_score = calculate_overall_sentiment(article_sentiment, comments_sentiment)
    breakdown = calculate_sentiment_breakdown(article_sentiment, comments_sentiment)

    sentiment_comparison = calculate_sentiment_comparison(article_sentiment, comments_sentiment)
    
    return {
    "topic": topic,
    "articles": article_sentiment,
    "youtube_comments": comments_sentiment,
    "overall_sentiment": sentiment_label,
    "sentiment_score": sentiment_score,
    "sentiment_breakdown": breakdown,
    "sentiment_comparison": sentiment_comparison
}

def fetch_news(topic):
    url = f'https://newsapi.org/v2/everything?qInTitle="{topic}"&apiKey={news_api_key}&language=en' #url of newsapi for a specific topic
    response = requests.get(url) #gets the data from that url
    return response.json() #returns the data in json format

def search_videos(topic):
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q="{topic}"&type=video&maxResults=5&key={youtube_api_key}'
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
    if "items" in comments_data: #if comments for this specific video exists, then the "items" key will be present in the comments_data dictionary. If it is not present, then there are no comments for this video.
        for comment in comments_data["items"]:
            comments.append(comment["snippet"]["topLevelComment"]["snippet"]["textOriginal"]) 
            #storing comments of a specified video in a list. The comments are stored in the "textOriginal" field of the 
            #"topLevelComment" object in the "snippet" object of each comment item.

    return comments

def fetch_youtube_data(topic): #ties together search_videos and fetch_comments
    video_results = search_videos(topic)
    all_comments = []
    if "items" in video_results:
        for item in video_results["items"]:
            if "videoId" in item["id"]:
                video_id = item["id"]["videoId"]
                all_comments.extend(fetch_comments(video_id)) #creating master list of all comments from all videos for a topic

    return all_comments

#print(fetch_youtube_data("Lebron")) test

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text): #this function uses vader to analze sentiment of a given text
    result = analyzer.polarity_scores(text)
    return result["compound"] #returns the compound score which summarizes overall sentiment

#print(analyze_sentiment("I love kyrie irving hes good at basketball"))

def analyze_comments_sentiment(comments): #this function analyzes sentiment of comments.
    scored_comments = []
    for comment in comments:
        score = analyze_sentiment(comment)
        #creating a list of dictionaries where each dictionary contains a comment and its sentiment score
        scored_comments.append({"comment": comment, "score": score})

    return scored_comments

def analyze_articles_sentiment(articles): #this function analyzes sentiment of articles
    for article in articles:
        title = article['title'] or "" #if title is None, then set it to an empty string
        description = article['description'] or "" #if description is None, then set it to an empty string

        combined_text = title + ". " + description #combined article title and description so I can compute one combined sentiment sore
        score = analyze_sentiment(combined_text)
        article["sentiment_score"] = score #adding a new key-value pair so we can keep other useful information in the dictonary
        article["combined_text"] = combined_text

    return articles

supabase = create_client(supabase_url, supabase_key) #creating a supabase client to connect to the supabase database using the url and key from the .env file

#print(supabase.table("posts").select("*").execute())

def save_to_supabase(topic, content, score):
    #saves the topic, articles, and comments to the supabase database
    data = {
        "topic": topic,
        "content": content,
        "sentiment_score": score
    }
    try:
        response = supabase.table("posts").insert(data).execute()
        return response
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
        return None

#save_to_supabase("test", "is awesome", 0.314)

def calculate_overall_sentiment(articles, comments): #this function calculates overall sentiment scores based on articles and comments.
    scores = []
    #appending all sentiment scores from articles and comments into one list
    for article in articles:
        scores.append(article["sentiment_score"])
    for comment in comments:
        scores.append(comment["score"])

    total = sum(scores)
    average_score = total / len(scores)

    if(average_score > 0.05):
        overall_sentiment = "positive"
    elif(average_score < -0.05):
        overall_sentiment = "negative"
    else:
        overall_sentiment = "neutral"

    return overall_sentiment, average_score

def calculate_sentiment_breakdown(articles, comments): #this function will split comments and articles into 3 categories: positive, neutral, and negative. Meant to be displayed as a piechart.
    scores = []
    for article in articles:
        scores.append(article["sentiment_score"])
    for comment in comments:
        scores.append(comment["score"])

    positive, neutral, negative = 0, 0, 0
    for score in scores:
        if score > 0.05:
            positive += 1
        elif score < -0.05:
            negative += 1
        else:
            neutral += 1
    return [{"name": "Positive", "value": positive}, 
            {"name": "Neutral", "value": neutral}, 
            {"name": "Negative", "value": negative}
            ]

def calculate_sentiment_comparison(articles, comments): #This function compares the average sentiment of articles vs comments
    article_scores = []
    comment_scores = []
    for article in articles:
        article_scores.append(article["sentiment_score"])

    for comment in comments:
        comment_scores.append(comment["score"])

    if article_scores:
        article_average = sum(article_scores) / len(article_scores)
    else:
        article_average = 0
    if comment_scores:
        comment_average = sum(comment_scores) / len(comment_scores)
    else:
        comment_average = 0

    return {"articles_avg": article_average, "comments_avg": comment_average}



