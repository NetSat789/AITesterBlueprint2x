from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# 1. Define the EXACT output shape. No loose text — real fields.
class Triage(BaseModel):
    title: str            = Field(description="One-line normalized title")
    severity: str         = Field(description="Critical | High | Medium | Low")
    priority: str         = Field(description="P0 | P1 | P2 | P3")
    component: str        = Field(description="Most likely affected area")
    suggested_team: str   = Field(description="Team that should own this")
    likely_duplicate: str = Field(description="'true' or 'false'")
    reasoning: str        = Field(description="2-3 line justification")

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

# 2. Bind the schema. The model now RETURNS a Triage object.
triager = llm.with_structured_output(Triage)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You triage bugs for a web product. Map user impact to "
                "severity and business urgency to priority. Be decisive."),
    ("human", "Bug report:\n\n{report}"),
])

chain = prompt | triager

# 3. Run it on a real report.
result = chain.invoke({"report": """
Users on the mobile app cannot complete payment. After tapping 'Pay'
the spinner runs forever. Started after the 4.2.0 release. About 30%
of checkout attempts affected. No crash, no error toast.
"""})

# result is a real object — use the fields directly.
print(f"{result.severity} / {result.priority}  ->  {result.component}")
print(f"Owner: {result.suggested_team}  | dupe? {result.likely_duplicate}")
print(result.reasoning)