"""Bug Triage Dashboard — Streamlit UI with enhanced design."""

import os
import sys
from pathlib import Path
from datetime import datetime

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bug_traige_agent_prod_ready import triage_ticket, build_chain

# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Bug Triage Dashboard",
    page_icon="🐛",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Custom CSS
# ---------------------------------------------------------------------------
st.markdown("""
    <style>
    /* ---- base ---- */
    .stApp {
        background: #ffffff;
    }
    .main .block-container {
        padding: 1.5rem 2rem 3rem;
    }

    /* ---- metric tweaks ---- */
    [data-testid="metric-container"] {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 14px 18px;
        box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    [data-testid="metric-container"] > div:first-child {
        color: #6c757d;
        font-size: .75rem;
        text-transform: uppercase;
        letter-spacing: .04em;
    }
    [data-testid="metric-container"] > div:nth-child(2) {
        color: #212529;
        font-size: 1.1rem;
        font-weight: 700;
    }

    /* ---- severity badges ---- */
    .sev-Critical  { background:#dc3545; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .sev-High      { background:#fd7e14; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .sev-Medium    { background:#ffc107; color:#000; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .sev-Low       { background:#28a745; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }

    /* ---- priority badges ---- */
    .pri-P0 { background:#dc3545; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .pri-P1 { background:#fd7e14; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .pri-P2 { background:#ffc107; color:#000; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }
    .pri-P3 { background:#28a745; color:#fff; padding:2px 12px; border-radius:20px; font-weight:700; font-size:.8rem; }

    /* ---- detail card ---- */
    .ticket-card {
        background: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.2rem;
        box-shadow: 0 2px 12px rgba(0,0,0,.06);
    }
    .ticket-card h3 {
        margin:0 0 4px; color:#212529; font-size:1.1rem;
    }
    .ticket-card .ticket-key {
        color:#dc3545; font-size:.85rem; font-weight:600; letter-spacing:.03em;
    }
    .ticket-card .reasoning {
        background:#f8f9fa; border-left:3px solid #dc3545;
        border-radius:8px; padding:12px 16px; margin:12px 0 0;
        color:#495057; font-size:.9rem; line-height:1.5;
    }

    /* ---- rag pill ---- */
    .rag-pill {
        display:inline-block; background:#f1f3f5; border:1px solid #dee2e6;
        border-radius:20px; padding:3px 14px; margin:3px 4px 3px 0;
        font-size:.8rem; color:#495057;
    }
    .rag-pill strong { color:#0d6efd; }

    /* ---- history ---- */
    .history-item {
        background:#f8f9fa; border:1px solid #e9ecef;
        border-radius:10px; padding:10px 16px; margin-bottom:6px;
        font-size:.85rem; color:#212529;
    }

    /* ---- sidebar ---- */
    .css-1d391kg, [data-testid="stSidebar"] {
        background:#f8f9fa;
    }
    [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
        color:#212529;
    }

    /* ---- divider ---- */
    hr {
        border-color:#dee2e6 !important;
        margin:1.5rem 0 !important;
    }

    /* ---- stText tweaks ---- */
    h1, h2, h3 {
        color:#212529;
    }
    p, li, .stMarkdown {
        color:#495057;
    }
    </style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/bug.png", width=56)
    st.markdown("### ⚙️ Config")

    if "chain" not in st.session_state:
        st.session_state.chain = build_chain()

    if "history" not in st.session_state:
        st.session_state.history = []

    st.caption("LLM model is read from `.env` at launch.")
    st.caption("RAG knowledge base must be built first via `python -m rag.ingest`.")

    st.divider()
    st.markdown("### 📋 Triage History")
    if not st.session_state.history:
        st.caption("No tickets triaged yet.")
    else:
        for entry in reversed(st.session_state.history[-20:]):
            sev = entry["severity"]
            pri = entry["priority"]
            st.markdown(
                f'<div class="history-item">'
                f'<span class="ticket-key">{entry["key"]}</span>  '
                f'<span class="sev-{sev}">{sev}</span>&nbsp;'
                f'<span class="pri-{pri}">{pri}</span>  '
                f'{entry["title"][:55]}{"…" if len(entry["title"])>55 else ""}'
                f'</div>',
                unsafe_allow_html=True,
            )

    if st.button("🗑️ Clear History"):
        st.session_state.history = []
        st.rerun()

# ---------------------------------------------------------------------------
# Main header
# ---------------------------------------------------------------------------
col_logo, col_title = st.columns([.06, 1])
with col_logo:
    st.markdown("# 🐛")
with col_title:
    st.markdown("# Bug Triage Dashboard")
    st.caption(
        "Fetch JIRA tickets and triage them against a RAG knowledge base of "
        "past bugs, test cases, and related tickets."
    )

st.divider()

# ---------------------------------------------------------------------------
# Input area
# ---------------------------------------------------------------------------
keys_input = st.text_input(
    "JIRA ticket key(s)",
    placeholder="e.g. KAN-24, KAN-21",
    help="Enter one or more comma- or space-separated JIRA issue keys.",
)

col_btn, col_status = st.columns([1, 3])
with col_btn:
    triage_clicked = st.button("🚀 Triage", type="primary", use_container_width=True)
with col_status:
    status_placeholder = st.empty()

# ---------------------------------------------------------------------------
# Triage execution
# ---------------------------------------------------------------------------
if triage_clicked and keys_input:
    keys = [k.strip() for k in keys_input.replace(",", " ").split() if k.strip()]
    if not keys:
        status_placeholder.warning("No ticket keys entered.")
    else:
        n = len(keys)
        progress_bar = st.progress(0, text="Initialising…")
        results_container = st.container()

        all_results = []
        for i, key in enumerate(keys):
            status_placeholder.info(f"🔍 Triaging **{key}** ({i + 1}/{n})…")
            progress_bar.progress((i) / n, text=f"Triaging {key}…")

            res = triage_ticket(key, chain=st.session_state.chain)
            all_results.append(res)

            sev = res.get("triage", "").severity if not res.get("error") else "?"
            pri = res.get("triage", "").priority if not res.get("error") else "?"
            label = res.get("triage", "").title if not res.get("error") else res.get("error", "")
            st.session_state.history.append({
                "key": key, "severity": sev, "priority": pri, "title": label,
            })

        progress_bar.progress(1.0, text="Done ✅")
        status_placeholder.success(f"Triaged {n} ticket(s) successfully.")

        # ---- render results ----
        for idx, res in enumerate(all_results):
            key = res["key"]

            # error case
            if res.get("error"):
                with results_container:
                    st.error(f"**{key}** — {res['error']}")
                continue

            t = res["triage"]
            rag = res.get("rag") or []

            # card header
            sev_badge = f'<span class="sev-{t.severity}">{t.severity}</span>'
            pri_badge = f'<span class="pri-{t.priority}">{t.priority}</span>'

            results_container.markdown(
                f'<div class="ticket-card">'
                f'<div style="display:flex;justify-content:space-between;align-items:flex-start;">'
                f'<div><span class="ticket-key">{key}</span>'
                f'<h3>{t.title}</h3></div>'
                f'<div style="display:flex;gap:6px;flex-wrap:nowrap;">{sev_badge} {pri_badge}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )

            # metrics row
            mcol1, mcol2, mcol3, mcol4 = results_container.columns(4)
            mcol1.metric("Severity", t.severity)
            mcol2.metric("Priority", t.priority)
            mcol3.metric("Component", t.component)
            mcol4.metric("Owner", t.suggested_team)

            # duplicate indicator
            dcol1, dcol2 = results_container.columns(2)
            dup_icon = "🔁" if t.likely_duplicate == "True" else "✅"
            dcol1.metric("Duplicate?", f"{dup_icon} {t.likely_duplicate}")
            dcol2.metric("Suggested Team", t.suggested_team)

            # reasoning
            results_container.markdown(
                f'<div class="reasoning">{t.reasoning}</div>',
                unsafe_allow_html=True,
            )

            # RAG matches
            if rag:
                with results_container.expander(f"📚 RAG Matches ({len(rag)} used)", expanded=False):
                    rag_html = ""
                    for r in rag:
                        m = r["metadata"]
                        score = 1 - r["distance"]
                        rag_html += (
                            f'<span class="rag-pill">'
                            f'<strong>[{m.get("type", "?")}]</strong> '
                            f'{r["id"]}  —  <em>score {score:.2f}</em>'
                            f'</span>'
                        )
                    results_container.markdown(rag_html, unsafe_allow_html=True)

            # close card
            results_container.markdown("</div>", unsafe_allow_html=True)
