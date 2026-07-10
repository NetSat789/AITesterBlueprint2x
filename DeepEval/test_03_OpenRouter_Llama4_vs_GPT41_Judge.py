# Exercise 3: Model under test = gpt-4o-mini (OpenRouter), Judge = Groq Llama.
#
#   Model under test:  gpt-4o-mini via OpenRouter
#   Judge:             llama-3.3-70b-versatile via Groq

import os

from openai import OpenAI
from deepeval import assert_test
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

# ── Model under test: gpt-4o-mini via OpenRouter ──────────────────────
OPENROUTER_MODEL = "gpt-4o-mini"

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

def ask_openrouter(prompt: str) -> str:
    resp = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return resp.choices[0].message.content


# ── Judge: Groq llama-3.3-70b-versatile via DeepEval ───────────────────
os.environ["OPENAI_BASE_URL"] = "https://api.groq.com/openai/v1"
os.environ["OPENAI_API_KEY"] = os.getenv("GROQ_API_KEY", "")
os.environ["OPENAI_MODEL_NAME"] = "llama-3.3-70b-versatile"


# ── Test case ─────────────────────────────────────────────────────────
def test_openrouter_answer_relevancy():
    question = "What are the key differences between a CPU and a GPU?"

    answer = ask_openrouter(question)

    test_case = LLMTestCase(
        input=question,
        actual_output=answer,
        expected_output="",
        context=[
            "CPUs have a few powerful cores optimized for sequential tasks.",
            "GPUs have thousands of smaller cores designed for parallel processing.",
        ],
    )

    metric = AnswerRelevancyMetric(threshold=0.7)

    assert_test(test_case, [metric])
