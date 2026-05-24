import os
import anthropic
from dotenv import load_dotenv
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from price_agent import run_price_agent
from news_agent import run_news_agent
from technical_agent import run_technical_agent

load_dotenv()

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')


def run_orchestrator():
    """
    Orchestrate all agents and generate final
    BUY / SELL / HOLD decision using Claude.
    """
    print("=" * 55)
    print("BTC MULTI-AGENT ORCHESTRATOR")
    print("=" * 55)

    # ── Step 1: Run all agents ────────────────────────
    print("\n[1/4] Running Price Agent...")
    price = run_price_agent()

    print("\n[2/4] Running News Agent...")
    news = run_news_agent()

    print("\n[3/4] Running Technical Agent...")
    technical = run_technical_agent()

    # ── Step 2: Build context ─────────────────────────
    print("\n[4/4] Running Orchestrator (Claude)...")

    prompt = f"""
You are a senior quantitative analyst at a crypto
hedge fund. Three independent signal sources have
been collected for Bitcoin (BTC/USDT).

Your task is to synthesize all signals and produce
a single, well-reasoned trading decision.

═══════════════════════════════════════
SIGNAL 1 — PRICE FORECAST (GRU Model)
═══════════════════════════════════════
Current price:    ${price['current_price']:,.2f}
Predicted t+1h:   ${price['predicted_price']:,.2f}
Expected change:  {price['change_pct']:+.2f}%
Direction:        {price['direction']}

═══════════════════════════════════════
SIGNAL 2 — NEWS SENTIMENT (NLP)
═══════════════════════════════════════
Sentiment:        {news['sentiment']}
Score:            {news['score']:+.2f} (-1 to +1)
Confidence:       {news['confidence']}
Key themes:       {', '.join(news['themes'])}
Summary:          {news['summary']}

═══════════════════════════════════════
SIGNAL 3 — TECHNICAL ANALYSIS
═══════════════════════════════════════
RSI (14):         {technical['rsi']} → {technical['rsi_signal']}
MACD:             {technical['macd']} → {technical['macd_signal']}
Bollinger Bands:  {technical['bb_signal']}
Buy signals:      {technical['buy_signals']}/3
Sell signals:     {technical['sell_signals']}/3
Overall:          {technical['overall']}

═══════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════
Analyze all three signals together.
Consider conflicts and agreements between signals.
Respond EXACTLY in this format:

DECISION: BUY/SELL/HOLD
CONFIDENCE: 0-100%
RISK: LOW/MEDIUM/HIGH
REASONING: 3-4 sentences explaining your decision,
           citing specific signals.
WARNINGS: any risks or caveats to be aware of.
"""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        temperature=0.2,
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    raw = response.content[0].text

    # ── Step 3: Parse decision ────────────────────────
    decision = {
        'decision':   'HOLD',
        'confidence': '50%',
        'risk':       'MEDIUM',
        'reasoning':  '',
        'warnings':   ''
    }

    for line in raw.strip().split('\n'):
        line = line.strip()
        if line.startswith('DECISION:'):
            decision['decision'] = \
                line.split(':')[1].strip()
        elif line.startswith('CONFIDENCE:'):
            decision['confidence'] = \
                line.split(':')[1].strip()
        elif line.startswith('RISK:'):
            decision['risk'] = \
                line.split(':')[1].strip()
        elif line.startswith('REASONING:'):
            decision['reasoning'] = \
                line.split(':', 1)[1].strip()
        elif line.startswith('WARNINGS:'):
            decision['warnings'] = \
                line.split(':', 1)[1].strip()

    # ── Step 4: Final output ──────────────────────────
    print("\n" + "=" * 55)
    print("FINAL DECISION")
    print("=" * 55)
    print(f"Current BTC:  ${price['current_price']:,.2f}")
    print(f"Predicted:    ${price['predicted_price']:,.2f} "
          f"({price['change_pct']:+.2f}%)")
    print(f"News:         {news['sentiment']} "
          f"({news['score']:+.2f})")
    print(f"Technical:    {technical['overall']}")
    print("-" * 55)
    print(f"DECISION:     {decision['decision']}")
    print(f"CONFIDENCE:   {decision['confidence']}")
    print(f"RISK:         {decision['risk']}")
    print(f"REASONING:    {decision['reasoning']}")
    print(f"WARNINGS:     {decision['warnings']}")
    print("=" * 55)

    return {
        'price':     price,
        'news':      news,
        'technical': technical,
        'decision':  decision
    }


if __name__ == '__main__':
    result = run_orchestrator()