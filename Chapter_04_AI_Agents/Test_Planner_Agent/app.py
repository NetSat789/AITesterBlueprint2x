import streamlit as st
import sys
import os

# Add tools to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'tools'))
from tools.jira_client import JiraClient
from tools.llm_client import LLMClient
from tools.document_generator import DocumentGenerator
from tools.test_jira_connection import test_jira_connection
from tools.test_llm_connection import test_llm_connection

st.set_page_config(page_title="AI Test Planner Agent", page_icon="🚀", layout="wide")

st.title("🚀 AI Test Planner Agent (B.L.A.S.T Framework)")
st.markdown("Automatically generate comprehensive Test Plans from Jira Tickets using LLMs.")

col1, col2 = st.columns(2)

with col1:
    st.header("1. Jira Connection Settings")
    jira_url = st.text_input("Jira URL", value="https://yourcompany.atlassian.net")
    jira_email = st.text_input("Email")
    jira_token = st.text_input("API Token", type="password")
    
    if st.button("Test Jira Connection"):
        with st.spinner("Testing Connection..."):
            success = test_jira_connection(jira_url, jira_email, jira_token)
            if success:
                st.success("Jira connected successfully!")
            else:
                st.error("Failed to connect to Jira.")

with col2:
    st.header("2. LLM Connection Settings")
    llm_provider = st.selectbox("LLM Provider", ["Ollama", "Groq", "Grok"])
    llm_base_url = st.text_input("Base URL (For local Ollama)", value="http://localhost:11434")
    llm_api_key = st.text_input("API Key (For Groq/Grok)", type="password")
    llm_model = st.text_input("Model Name", value="llama3")
    
    if st.button("Test LLM Connection"):
        with st.spinner("Testing Connection..."):
            success = test_llm_connection(llm_provider, llm_base_url, llm_api_key, llm_model)
            if success:
                st.success(f"{llm_provider} connected successfully!")
            else:
                st.error(f"Failed to connect to {llm_provider}.")

st.divider()

st.header("3. Generate Test Plan")
ticket_id = st.text_input("Ticket ID (e.g., TEST-123)")
additional_context = st.text_area("Additional Context (Optional)", placeholder="E.g., Focus on security testing...")

if st.button("Generate Test Plan", type="primary"):
    if not ticket_id or not jira_url or not jira_email or not jira_token:
        st.error("Please fill in all Jira connection settings and the Ticket ID.")
    else:
        # Step 1: Fetch Ticket
        st.info(f"Fetching Jira Ticket: {ticket_id}...")
        client = JiraClient(jira_url, jira_email, jira_token)
        ticket_data = client.fetch_ticket(ticket_id)
        
        if ticket_data.get("error"):
            st.error(ticket_data.get("message"))
        else:
            st.success(f"Fetched Ticket: {ticket_data.get('title')}")
            
            # Step 2: Generate Content
            st.info("Generating Test Plan via LLM...")
            llm = LLMClient(llm_provider, llm_base_url, llm_api_key, llm_model)
            llm_res = llm.generate_test_plan(ticket_data, additional_context)
            
            if llm_res.get("error"):
                st.error(llm_res.get("message"))
            else:
                st.success("Test Plan Generated!")
                markdown_content = llm_res.get("markdown")
                
                # Show in UI
                with st.expander("Preview Test Plan", expanded=True):
                    st.markdown(markdown_content)
                
                # Step 3: Save Document
                doc_gen = DocumentGenerator()
                save_res = doc_gen.save_markdown(f"{ticket_id}_TestPlan", markdown_content)
                if save_res.get("error"):
                    st.error("Failed to save file: " + save_res.get("message"))
                else:
                    st.success(f"File saved to: {save_res.get('file_path')}")
                    
                    st.download_button(
                        label="Download Markdown",
                        data=markdown_content,
                        file_name=f"{ticket_id}_TestPlan.md",
                        mime="text/markdown"
                    )
