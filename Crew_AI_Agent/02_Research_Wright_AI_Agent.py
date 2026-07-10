# Research & Writer AI Agent
# 
# Two agents: a QA research analyst finds common web app bugs,
# and a documentation writer turns findings into an actionable checklist.

import crewai.llms.cache as _cache
_cache.mark_cache_breakpoint = lambda msg: msg

from crewai import Agent, Task, Crew, Process
from crewai import LLM
from dotenv import load_dotenv
import os

# Step 0 - Setup the Brain (GPT-OSS 120B via Groq)
groq_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_KEY"),
)

# Research Wright Agent
researcher_agent = Agent(
    role="QA Research Analyst",
    goal="Conduct research and find common bugs on web applications.",
    backstory="You are a QA research analyst with " \
    "thousands of bug reports across web applications. " \
    "You specialize in finding patterns and trends in software defects.",
    llm=groq_llm,
    verbose=True
)

writer_agent = Agent(
    role="QA Documentation Writer",
    goal="Write clear and concise reports based on the research findings.",
    backstory="You are a skilled content writer with a background in " \
    "QA documentation. You turn complex bug data into simple actionable checklists that developers can follow.",
    llm=groq_llm,
    verbose=True
)

research_task = Task(
    description="Research the top 5 most common bugs found in modern web applications and list them with examples.",
    expected_output="A list of 5 common web application bugs with descriptions and real-world examples.",
    agent=researcher_agent
)

writing_task = Task(
    description="Based on the research findings, write a clear and concise QA checklist that developers can use to avoid these common bugs.",
    expected_output="A numbered checklist of actionable items for developers to prevent common web application bugs.",
    agent=writer_agent
)

crew = Crew(
    agents=[researcher_agent, writer_agent],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff()
output_file = "research_wright_output.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(str(result))
print(f"Result saved to {output_file}")
print(result)