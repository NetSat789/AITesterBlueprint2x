# Test Ananlyst Agent
# 
# a senior QA with 15 years (JIRA MD)
#  of experience. Based on the feature, 
# it will just analyze the requirement
#  and suggest a 5-10 testcases(p0 testcases).

import crewai.llms.cache as _cache
_cache.mark_cache_breakpoint = lambda msg: msg

from crewai import Agent, Task, Crew
from crewai import LLM
from dotenv import load_dotenv
import os

# Step 0 - Setup the Brain (GPT-OSS 120B via Groq)
groq_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_KEY"),
)

# Step 1 - Define the Agent (identity)
qa_agent = Agent(
    role="QA Engineer",
    goal="Analyse the feature and the requirements, and create 5-10 test cases out of it.",
    backstory="You are a senior QA engineer with 15 years of experience in test planning and testcases creation",
    llm=groq_llm,
    verbose=True
)

# Step 2 - Give the Task to the Agent
test_case_task = Task(
    description="Create 5-10 test cases",
    expected_output="A numbered list of 5-10 test cases with brief descriptions for a app.vwo.com Login page with the username, password and submit button with remember me functionality",
    agent=qa_agent
)

# 3. Add them to the Crew
crew = Crew(
    agents=[qa_agent],
    tasks=[test_case_task],
    verbose=True
)

result = crew.kickoff()
output_file = "test_cases_output.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(str(result))
print(f"Test cases saved to {output_file}")
print(result)