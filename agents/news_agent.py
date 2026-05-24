import os
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_KEY = os.getenv('NEWSAPI_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')


def fetch_btc_news():
    """Fetch latest BTC news from NewsAPI."""
    url = "https://newsapi.org/v2/everything"
    params = {
        'q':        'Bitcoin BTC cryptocurrency',
        'sortBy':   'publishedAt',
        'pageSize': 10,
        'language': 'en',
        'apiKey':   NEWSAPI_KEY
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    articles = resp.json().get('articles', [])

    news = []
    for a in articles:
        if a.get('title') and a.get('description'):
            news.append({
                'title':       a['title'],
                'description': a['description'],
                'source':      a['source']['name'],
                'publishedAt': a['publishedAt']
            })
    return news


def analyze_sentiment(news):
    """Use Groq to analyze news sentiment."""
    client = Groq(api_key=GROQ_API_KEY)

    headlines = "\n".join([
        f"- {a['title']}" for a in news
    ])

    prompt = f"""
You are a crypto market analyst specializing in 
sentiment analysis.

Analyze these Bitcoin news headlines and respond
EXACTLY in this format with no extra text:

SENTIMENT: BULLISH/BEARISH/NEUTRAL
SCORE: number between -1.0 and 1.0
THEMES: theme1, theme2, theme3
CONFIDENCE: LOW/MEDIUM/HIGH
SUMMARY: one sentence explaining the sentiment

Headlines:
{headlines}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{
            "role": "user",
            "content": prompt
        }],
        temperature=0.3,
        max_tokens=200
    )
    return response.choices[0].message.content


def parse_sentiment(text):
    """Parse sentiment response."""
    result = {
        'sentiment':  'NEUTRAL',
        'score':      0.0,
        'themes':     [],
        'confidence': 'MEDIUM',
        'summary':    ''
    }

    for line in text.strip().split('\n'):
        line = line.strip()
        if line.startswith('SENTIMENT:'):
            result['sentiment'] = \
                line.split(':')[1].strip()
        elif line.startswith('SCORE:'):
            try:
                result['score'] = float(
                    line.split(':')[1].strip()
                )
            except:
                result['score'] = 0.0
        elif line.startswith('THEMES:'):
            themes = line.split(':')[1].strip()
            result['themes'] = [
                t.strip() for t in themes.split(',')
            ]
        elif line.startswith('CONFIDENCE:'):
            result['confidence'] = \
                line.split(':')[1].strip()
        elif line.startswith('SUMMARY:'):
            result['summary'] = \
                line.split(':', 1)[1].strip()

    return result


def run_news_agent():
    """Fetch BTC news and analyze sentiment."""
    print("=" * 50)
    print("NEWS AGENT")
    print("=" * 50)

    # ── Fetch news ────────────────────────────────────
    print("Fetching BTC news...")
    news = fetch_btc_news()
    print(f"Fetched {len(news)} articles")

    print("\nLatest headlines:")
    for i, a in enumerate(news[:5], 1):
        print(f"  {i}. {a['title'][:60]}...")

    # ── Analyze sentiment ─────────────────────────────
    print("\nAnalyzing sentiment with Groq...")
    raw = analyze_sentiment(news)
    sentiment = parse_sentiment(raw)

    print("\n" + "=" * 50)
    print("SENTIMENT ANALYSIS")
    print("=" * 50)
    print(f"Sentiment:  {sentiment['sentiment']}")
    print(f"Score:      {sentiment['score']:+.2f}")
    print(f"Confidence: {sentiment['confidence']}")
    print(f"Themes:     {', '.join(sentiment['themes'])}")
    print(f"Summary:    {sentiment['summary']}")
    print("=" * 50)

    return sentiment


if __name__ == '__main__':
    result = run_news_agent()
    print("\nResult:", result)
    