# Exercise 2: Real LLM under test, real LLM as judge.
#
#   Model under test:  Groq Llama-4 Scout (meta-llama/llama-3.3-70b-versatile)
#   Judge:             Opencart gpt-4o-mini
#
# Setup:
#   export GROQ_API_KEY=your_groq_key
#   export OPENAI_API_KEY=your_opencart_key    # used by the DeepEval judge
#   export OPENAI_BASE_URL=https://opencart.example.com/v1
#   export OPENAI_MODEL_NAME=gpt-4o-mini

import os

import groq
from deepeval import assert_test
from deepeval.metrics import AnswerRelevancyMetric, HallucinationMetric
from deepeval.test_case import LLMTestCase

# ── Model under test: Groq Llama-4 Scout ──────────────────────────────
GROQ_MODEL = "llama-3.3-70b-versatile"

client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq(prompt: str) -> str:
    resp = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return resp.choices[0].message.content


# ── Judge: Opencart gpt-4o-mini via DeepEval ──────────────────────────
# DeepEval picks up OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL_NAME
# from the environment when USE_OPENAI_MODEL is set or automatically.
# The judge model used by metrics defaults to gpt-4o-mini.
# Point it at the Opencart-compatible endpoint.
os.environ.setdefault("OPENAI_BASE_URL", "https://api.opencart.ai/v1")
os.environ.setdefault("OPENAI_MODEL_NAME", "gpt-4o-mini")


# ── Test case ─────────────────────────────────────────────────────────
def test_groq_answer_relevancy():
    question = "Explain the difference between supervised and unsupervised learning in one paragraph."

    answer = ask_groq(question)

    test_case = LLMTestCase(
        input=question,
        actual_output=answer,
        expected_output="",
        context=[
            "Supervised learning uses labeled data where input-output pairs are provided.",
            "Unsupervised learning finds patterns in unlabeled data without explicit output labels.",
        ],
    )

    metric = AnswerRelevancyMetric(threshold=0.7)

    assert_test(test_case, [metric])
