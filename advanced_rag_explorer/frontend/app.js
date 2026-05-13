/* app.js — Advanced RAG Explorer */
const API = 'http://127.0.0.1:8001';

// ── State ──────────────────────────────────────
let selectedFile = null;

// ── DOM refs ───────────────────────────────────
const fileInput   = document.getElementById('fileInput');
const dropZone    = document.getElementById('dropZone');
const fileChip    = document.getElementById('fileChip');
const chipName    = document.getElementById('chipName');
const chipSize    = document.getElementById('chipSize');
const btnIngest   = document.getElementById('btnIngest');
const btnReset    = document.getElementById('btnReset');
const btnRefreshDb= document.getElementById('btnRefreshDb');
const btnSend     = document.getElementById('btnSend');
const chatInput   = document.getElementById('chatInput');
const chatMessages= document.getElementById('chatMessages');
const rightContent= document.getElementById('rightContent');
const rightTitle  = document.getElementById('rightTitle');
const rightStatus = document.getElementById('rightStatus');
const dbContent   = document.getElementById('dbContent');
const apiKeyInput = document.getElementById('apiKey');
const dbBadge     = document.getElementById('dbBadge');

// ── Tabs ───────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'db') refreshDb();
  });
});

// ── File Upload ────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function handleFile(f) {
  selectedFile = f;
  chipName.textContent = f.name;
  chipSize.textContent = formatBytes(f.size);
  fileChip.style.display = 'flex';
  btnIngest.disabled = false;
  showPreview(f);
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

// ── File Preview ───────────────────────────────
async function showPreview(f) {
  setRight('📄 File Preview', 'Loading preview…');
  clearRight();
  addSection('parse', '📂', 'Parsing File', 'Processing…', 'blue');
  const body = getSectionBody('parse');
  body.innerHTML = '<div class="progress-label">Uploading…</div>';

  const fd = new FormData();
  fd.append('file', f);
  try {
    const r = await fetch(API + '/api/upload-preview', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) { body.innerHTML = err(d.detail); return; }

    setSectionBadge('parse', `${d.rows} rows · ${d.col_count} cols`, 'green');
    body.innerHTML = `
      <div style="margin-bottom:10px">
        <div class="section-label">File Info</div>
        <div style="display:flex;gap:16px;font-size:12px;color:var(--text-muted)">
          <span>📁 <b style="color:var(--accent)">${d.filename}</b></span>
          <span>📊 ${d.rows} rows</span>
          <span>🔢 ${d.col_count} columns</span>
        </div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-muted)">
          Columns: <span style="color:var(--claude-light)">${d.columns.join(' · ')}</span>
        </div>
      </div>
      <div class="section-label">Row Serialisation Preview (first 3 rows)</div>
      <div class="chunk-grid">
        ${(d.row_texts_preview||[]).slice(0,3).map((t,i)=>`
          <div class="chunk-card">
            <div class="chunk-meta"><span class="tag">Row ${i+1}</span></div>
            <div class="chunk-text">${escHtml(t)}</div>
          </div>`).join('')}
      </div>
      <div class="section-label" style="margin-top:12px">Data Table Preview (all ${d.rows} rows)</div>
      ${buildTable(d.columns, d.preview_rows, 'previewTbl', 10)}
    `;
    openSection('parse');
    rightStatus.textContent = `Ready to ingest ${d.rows} rows`;
  } catch(e) { body.innerHTML = err(e.message); }
}

function buildTable(cols, rows, containerId, pageSize = 10) {
  if (!rows || !rows.length) return '<div class="db-empty">No data</div>';
  const id = containerId || ('tbl_' + Math.random().toString(36).slice(2));
  const html = `<div id="${id}_wrap">
    <div style="overflow-x:auto"><table class="data-table" id="${id}_table">
      <thead><tr>${cols.map(c=>`<th>${escHtml(c)}</th>`).join('')}</tr></thead>
      <tbody id="${id}_tbody"></tbody>
    </table></div>
    <div class="pager" id="${id}_pager"></div>
  </div>`;
  // defer pager init until element is in DOM
  requestAnimationFrame(() => {
    const tbody = document.getElementById(id + '_tbody');
    const pager = document.getElementById(id + '_pager');
    if (tbody && pager) makePager(rows, pageSize, (page, ps) => {
      const slice = rows.slice(page * ps, page * ps + ps);
      tbody.innerHTML = slice.map(r=>`<tr>${cols.map(c=>`<td class="truncate">${escHtml(String(r[c]||''))}</td>`).join('')}</tr>`).join('');
    }, pager);
  });
  return html;
}

/**
 * Generic client-side pager.
 * @param {Array}    items    – full data array
 * @param {number}   pageSize – items per page
 * @param {Function} render   – (pageIndex, pageSize) => void
 * @param {Element}  pagerEl  – container to render page controls into
 */
function makePager(items, pageSize, render, pagerEl) {
  let cur = 0;
  const total = () => Math.max(1, Math.ceil(items.length / pageSize));
  function draw() {
    render(cur, pageSize);
    const t = total();
    if (t <= 1) { pagerEl.innerHTML = ''; return; }
    const maxBtns = 7;
    let pages = [];
    if (t <= maxBtns) {
      for (let i = 0; i < t; i++) pages.push(i);
    } else {
      pages = [0];
      let lo = Math.max(1, cur - 2), hi = Math.min(t - 2, cur + 2);
      if (lo > 1) pages.push('…');
      for (let i = lo; i <= hi; i++) pages.push(i);
      if (hi < t - 2) pages.push('…');
      pages.push(t - 1);
    }
    pagerEl.innerHTML = `
      <button class="pg-btn" id="${pagerEl.id}_prev" ${cur===0?'disabled':''}>‹ Prev</button>
      ${pages.map(p => p === '…'
        ? `<span class="pg-ellipsis">…</span>`
        : `<button class="pg-btn ${p===cur?'active':''}" data-p="${p}">${p+1}</button>`
      ).join('')}
      <button class="pg-btn" id="${pagerEl.id}_next" ${cur===t-1?'disabled':''}>Next ›</button>
      <span class="pg-info">${items.length} items · page ${cur+1}/${t}</span>`;
    pagerEl.querySelector('#'+pagerEl.id+'_prev').onclick = () => { if (cur>0){cur--;draw();} };
    pagerEl.querySelector('#'+pagerEl.id+'_next').onclick = () => { if (cur<t-1){cur++;draw();} };
    pagerEl.querySelectorAll('.pg-btn[data-p]').forEach(b => {
      b.onclick = () => { cur = +b.dataset.p; draw(); };
    });
  }
  draw();
}

// ── Ingestion ──────────────────────────────────
btnIngest.addEventListener('click', startIngestion);

async function startIngestion() {
  if (!selectedFile) return;
  btnIngest.disabled = true;
  btnIngest.innerHTML = '⏳ Ingesting…';
  clearRight();
  setRight('⚡ Ingestion Pipeline', 'Running…');

  const chunkSize = +document.getElementById('cfgChunkSize').value || 5;
  const overlap   = +document.getElementById('cfgOverlap').value   || 1;

  // Progress bar section
  addSection('progress','⚡','Ingestion Progress','Starting…','blue');
  const progBody = getSectionBody('progress');
  progBody.innerHTML = `<div class="progress-wrap"><div class="progress-bar" id="progBar" style="width:0%"></div></div><div class="progress-label" id="progLabel">Initialising…</div>`;
  openSection('progress');

  const fd = new FormData();
  fd.append('file', selectedFile);
  fd.append('chunk_size', chunkSize);
  fd.append('overlap', overlap);

  try {
    const response = await fetch(API + '/api/ingest', { method: 'POST', body: fd });
    if (!response.ok) {
      const d = await response.json();
      progBody.innerHTML = err(d.detail);
      return;
    }
    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try { handleIngestionEvent(JSON.parse(line.slice(6))); } catch(_) {}
        }
      }
    }
  } catch(e) {
    progBody.innerHTML = err(e.message);
  }

  btnIngest.disabled = false;
  btnIngest.innerHTML = '<span>⚡</span> Start Ingestion';
  refreshStats();
}

function handleIngestionEvent(ev) {
  const bar   = document.getElementById('progBar');
  const label = document.getElementById('progLabel');
  if (bar)   bar.style.width = ev.progress + '%';
  if (label) label.textContent = ev.message;
  setSectionBadge('progress', ev.progress + '%', ev.progress >= 100 ? 'green' : 'blue');

  if (ev.stage === 'parse_done' && ev.data) renderParseStage(ev.data);
  if (ev.stage === 'serialize_done' && ev.data) renderSerializeStage(ev.data);
  if (ev.stage === 'chunk_done' && ev.data) renderChunkStage(ev.data);
  if (ev.stage === 'embed_done' && ev.data) renderEmbedStage(ev.data);
  if (ev.stage === 'store_done' && ev.data) renderStoreStage(ev.data);
  if (ev.stage === 'complete' && ev.data) renderComplete(ev.data);
}

function renderParseStage(d) {
  addSection('parse2','📂','Step 1 · File Parsed',`${d.rows} rows · ${d.col_count} cols`,'green');
  getSectionBody('parse2').innerHTML = `
    <div style="font-size:12px;color:var(--text-muted)">
      Columns: <span style="color:var(--claude-light)">${d.columns.join(' · ')}</span>
    </div>`;
  openSection('parse2');
}

function renderSerializeStage(d) {
  addSection('ser','🔤','Step 2 · Row Serialisation',`${d.total} rows serialised`,'green');
  const b = getSectionBody('ser');
  b.innerHTML = `
    <div class="section-label">Sample row texts</div>
    <div class="chunk-grid">
      ${(d.preview||[]).map((t,i)=>`
        <div class="chunk-card">
          <div class="chunk-meta"><span class="tag">Row ${i+1}</span></div>
          <div class="chunk-text">${escHtml(t.slice(0,250))}${t.length>250?'…':''}</div>
        </div>`).join('')}
    </div>`;
  openSection('ser');
}

function renderChunkStage(d) {
  addSection('chunk','🧩','Step 3 · Chunking',`${d.total_chunks} chunks (size=${d.chunk_size}, overlap=${d.overlap})`,'gold');
  const b = getSectionBody('chunk');
  const allChunks = d.chunks_preview || [];
  b.innerHTML = `
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">
      Algorithm: <b style="color:var(--accent)">Sliding-window row grouping</b> —
      every chunk shares <b style="color:var(--gold)">${d.overlap} overlap row(s)</b> with its neighbours.
    </div>
    <div class="chunk-grid" id="chunkGrid"></div>
    <div class="pager" id="chunkPager"></div>`;
  const grid = b.querySelector('#chunkGrid');
  const pager = b.querySelector('#chunkPager');
  makePager(allChunks, 6, (page, ps) => {
    grid.innerHTML = allChunks.slice(page*ps, page*ps+ps).map(c => `
      <div class="chunk-card ${c.chunk_index===0?'highlighted':''}">
        <div class="chunk-meta">
          <span class="tag">#${c.chunk_index+1}</span>
          <span class="tag">Rows ${c.start_row}–${c.end_row}</span>
          <span class="tag">${c.row_count} rows</span>
          <span class="tag">${c.word_count} words</span>
          ${c.overlap_rows>0?`<span class="overlap-badge">⚡ ${c.overlap_rows} overlap</span>`:''}
        </div>
        <div class="chunk-text">${escHtml(c.text_preview.slice(0,300))}${c.text_preview.length>300?'…':''}</div>
      </div>`).join('');
  }, pager);
  openSection('chunk');
}

function renderEmbedStage(d) {
  addSection('embed','🧠','Step 4 · Embeddings',`${d.embedding_dims} dims · ${d.embedding_model}`,'purple');
  const b = getSectionBody('embed');
  const bars = (d.sample_preview||[]).slice(0,20).map(v => {
    const pct = Math.round(((v + 1) / 2) * 100);
    return `<span style="height:${Math.max(4,pct*0.28)}px" title="${v.toFixed(4)}"></span>`;
  }).join('');
  b.innerHTML = `
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">
      Model: <span style="color:var(--claude-light)">${d.embedding_model}</span>
    </div>
    <div class="section-label">Embedding vector sparkline (first 20 dims of chunk #1)</div>
    <div class="emb-bar">${bars}</div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-dim)">
      Values range from −1.0 to +1.0 (L2-normalised cosine space)
    </div>`;
  openSection('embed');
}

function renderStoreStage(d) {
  addSection('store','🗄️','Step 5 · ChromaDB Storage',`${d.chunks_added} added · ${d.total_in_db} total`,'green');
  const b = getSectionBody('store');
  b.innerHTML = `
    <div class="stat-grid" style="max-width:360px">
      <div class="stat-item"><span class="stat-value">${d.chunks_added}</span><div class="stat-label">Chunks added</div></div>
      <div class="stat-item"><span class="stat-value">${d.total_in_db}</span><div class="stat-label">Total in DB</div></div>
      <div class="stat-item" style="grid-column:1/-1"><div class="stat-label" style="text-align:left">Collection</div><div style="font-size:13px;color:var(--claude-light);font-family:'JetBrains Mono',monospace">${d.collection}</div></div>
    </div>`;
  openSection('store');
}

function renderComplete(d) {
  setSectionBadge('progress','✅ Done','green');
  rightStatus.textContent = `✅ ${d.storage_stats?.chunks_added||0} chunks ingested`;
  setRight('✅ Ingestion Complete','Done');
  showToast('Ingestion complete!','success');
  refreshStats();
}

// ── Chat ───────────────────────────────────────
btnSend.addEventListener('click', sendQuery);
chatInput.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendQuery(); } });

async function sendQuery() {
  const q = chatInput.value.trim();
  if (!q) return;
  chatInput.value = '';
  appendBubble('user', q);
  const thinking = appendBubble('assistant thinking', '⏳ Thinking…');

  clearRight();
  setRight('💬 RAG Query Pipeline', 'Processing…');

  const topK  = +document.getElementById('chatTopK').value  || 10;
  const topN  = +document.getElementById('chatTopN').value  || 5;
  const apiKey = apiKeyInput.value.trim();

  try {
    const r = await fetch(API + '/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, top_k: topK, top_n_rerank: topN, api_key: apiKey }),
    });
    const d = await r.json();
    if (!r.ok) { thinking.textContent = '⚠️ ' + d.detail; thinking.classList.remove('thinking'); return; }

    thinking.textContent = d.answer?.answer || '(no answer)';
    thinking.classList.remove('thinking');
    renderQueryPipeline(q, d);
  } catch(e) {
    thinking.textContent = '⚠️ ' + e.message;
    thinking.classList.remove('thinking');
  }
}

function renderQueryPipeline(q, d) {
  const stats = d.pipeline_stats || {};

  // Step 1 – Retrieved chunks
  addSection('qr','🔍','Step 1 · Dense Retrieval',`${stats.top_k_retrieved} chunks via cosine similarity`,'blue');
  const qrBody = getSectionBody('qr');
  const retrievedChunks = d.retrieved_chunks || [];
  qrBody.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
      Model: <span style="color:var(--claude-light)">${stats.embedding_model||'—'}</span> · 
      Top-K: <b style="color:var(--accent)">${stats.top_k_retrieved}</b>
    </div>
    <div class="chunk-grid" id="qrGrid"></div>
    <div class="pager" id="qrPager"></div>`;
  const qrGrid = qrBody.querySelector('#qrGrid');
  const qrPager = qrBody.querySelector('#qrPager');
  makePager(retrievedChunks, 5, (page, ps) => {
    qrGrid.innerHTML = retrievedChunks.slice(page*ps, page*ps+ps).map(c=>`
      <div class="chunk-card">
        <div class="chunk-meta">
          <span class="tag">Rank #${c.original_rank}</span>
          <span class="tag">Rows ${c.metadata?.start_row??'?'}–${c.metadata?.end_row??'?'}</span>
        </div>
        <div class="score-bar-wrap">
          <span style="font-size:11px;color:var(--text-muted);min-width:90px">Similarity</span>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:${Math.max(0,c.similarity_score*100).toFixed(1)}%"></div></div>
          <span class="score-val">${c.similarity_score?.toFixed(4)}</span>
        </div>
        <div class="chunk-text" style="margin-top:8px">${escHtml((c.text||'').slice(0,250))}${(c.text||'').length>250?'…':''}</div>
      </div>`).join('');
  }, qrPager);
  openSection('qr');

  // Step 2 – Re-ranked
  addSection('rr','🎯','Step 2 · Cross-Encoder Re-ranking',`${stats.top_n_reranked} chunks re-scored`,'gold');
  const rrBody = getSectionBody('rr');
  rrBody.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
      Model: <span style="color:var(--claude-light)">${stats.reranker_model||'—'}</span>
    </div>
    <table class="data-table">
      <thead><tr><th>Final Rank</th><th>Orig Rank</th><th>Δ</th><th>Re-rank Score</th><th>Similarity</th><th>Preview</th></tr></thead>
      <tbody>
        ${(d.reranked_chunks||[]).map(c=>{
          const delta = c.rank_change||0;
          const deltaHtml = delta>0?`<span class="delta up">▲${delta}</span>`:delta<0?`<span class="delta down">▼${Math.abs(delta)}</span>`:`<span class="delta same">—</span>`;
          return `<tr>
            <td><b style="color:var(--accent)">#${c.final_rank}</b></td>
            <td class="mono">#${c.original_rank}</td>
            <td>${deltaHtml}</td>
            <td><div class="score-bar-wrap"><div class="score-bar-bg" style="width:80px"><div class="score-bar-fill" style="width:${Math.min(100,Math.max(0,(c.rerank_score+10)*5)).toFixed(1)}%"></div></div><span class="score-val">${c.rerank_score?.toFixed(3)}</span></div></td>
            <td class="mono">${c.similarity_score?.toFixed(4)}</td>
            <td class="truncate" style="max-width:200px;font-size:11px">${escHtml((c.text||'').slice(0,80))}…</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  openSection('rr');

  // Step 3 – Sent to LLM
  addSection('llm','⚡','Step 3 · Sent to LLM',`Top ${stats.top_3_to_llm} chunks → ${stats.llm_model}`,'purple');
  const llmBody = getSectionBody('llm');
  llmBody.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
      Model: <span style="color:var(--claude-light)">${stats.llm_model}</span> · 
      Context from top <b style="color:var(--accent)">${stats.top_3_to_llm}</b> re-ranked chunks
    </div>
    <div class="chunk-grid">
      ${(d.final_chunks_for_llm||[]).map((c,i)=>`
        <div class="chunk-card highlighted">
          <div class="chunk-meta">
            <span class="tag">Final rank #${c.final_rank}</span>
            <span class="tag">Re-rank: ${c.rerank_score?.toFixed(3)}</span>
          </div>
          <div class="chunk-text">${escHtml((c.text||'').slice(0,300))}${(c.text||'').length>300?'…':''}</div>
        </div>`).join('')}
    </div>`;
  openSection('llm');

  // Step 4 – LLM Answer
  addSection('ans','🤖','Step 4 · LLM Answer','Generated','green');
  const ansBody = getSectionBody('ans');
  const ans = d.answer || {};
  ansBody.innerHTML = `
    <div class="answer-card">
      <div class="answer-text">${escHtml(ans.answer||'No answer generated.')}</div>
      ${ans.total_tokens ? `
      <div class="token-row">
        <div class="token-item">Prompt tokens: <span>${ans.prompt_tokens}</span></div>
        <div class="token-item">Completion tokens: <span>${ans.completion_tokens}</span></div>
        <div class="token-item">Total tokens: <span>${ans.total_tokens}</span></div>
      </div>` : ''}
    </div>`;
  openSection('ans');
  rightStatus.textContent = '✅ Query complete';

  // Auto-scroll right panel so Step 4 (LLM Answer) is visible
  requestAnimationFrame(() => {
    const ansEl = document.getElementById('stage-ans');
    if (ansEl) ansEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  showStepNav(true);
}

// ── DB Explorer ────────────────────────────────
btnRefreshDb.addEventListener('click', refreshDb);

async function refreshDb() {
  dbContent.innerHTML = '<div class="db-empty">Loading…</div>';
  try {
    const r = await fetch(API + '/api/database');
    const d = await r.json();
    if (!d.chunks || !d.chunks.length) { dbContent.innerHTML = '<div class="db-empty">No chunks yet. Ingest a file first.</div>'; return; }
    const chunks = d.chunks;
    dbContent.innerHTML = `
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${d.total_chunks} chunks in <span style="color:var(--claude-light)">${d.collection}</span></div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>#</th><th>Chunk ID</th><th>Rows</th><th>Words</th><th>Dims</th><th>Preview</th></tr></thead>
          <tbody id="dbTbody"></tbody>
        </table>
      </div>
      <div class="pager" id="dbPager"></div>`;
    const tbody = document.getElementById('dbTbody');
    const pager = document.getElementById('dbPager');
    makePager(chunks, 15, (page, ps) => {
      const offset = page * ps;
      tbody.innerHTML = chunks.slice(offset, offset + ps).map((c, i) => `<tr>
        <td class="mono">${offset + i + 1}</td>
        <td class="mono" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.id.slice(0,16)}…</td>
        <td class="mono">${c.metadata?.start_row??'?'}–${c.metadata?.end_row??'?'}</td>
        <td class="mono">${c.metadata?.word_count??'?'}</td>
        <td class="mono">${c.metadata?.embedding_dims??'?'}</td>
        <td class="truncate" style="max-width:260px;font-size:11px">${escHtml((c.text_preview||'').slice(0,100))}…</td>
      </tr>`).join('');
    }, pager);
  } catch(e) { dbContent.innerHTML = '<div class="db-empty">Error: ' + e.message + '</div>'; }
}

// ── Stats ──────────────────────────────────────
async function refreshStats() {
  try {
    const r = await fetch(API + '/api/stats');
    const d = await r.json();
    document.getElementById('statChunks').textContent = d.total_chunks || 0;
    document.getElementById('statDims').textContent   = '768';
    document.getElementById('statModel').textContent  = 'nomic-v1.5';
    document.getElementById('statColl').textContent   = d.collection ? d.collection.slice(0,12)+'…' : '—';
    dbBadge.textContent = `DB: ${d.total_chunks||0} chunks`;
  } catch(_) {}
}

// ── Reset ──────────────────────────────────────
btnReset.addEventListener('click', async () => {
  if (!confirm('Reset the vector database? All chunks will be deleted.')) return;
  try {
    await fetch(API + '/api/reset', { method: 'DELETE' });
    showToast('Vector DB reset!', 'success');
    refreshStats();
  } catch(e) { showToast('Reset failed: ' + e.message, 'error'); }
});

// ── Right panel helpers ────────────────────────
function setRight(title, status) {
  rightTitle.textContent = title;
  rightStatus.textContent = status;
}
function clearRight() {
  rightContent.innerHTML = '';
  showStepNav(false);
}
function addSection(id, icon, title, badge, badgeType) {
  const el = document.createElement('div');
  el.className = 'stage';
  el.id = 'stage-' + id;
  el.innerHTML = `
    <div class="stage-header" onclick="toggleSection('${id}')">
      <span class="stage-icon">${icon}</span>
      <span class="stage-title">${title}</span>
      <span class="stage-badge badge-${badgeType} " id="badge-${id}">${badge}</span>
      <span class="stage-chevron" id="chev-${id}">▶</span>
    </div>
    <div class="stage-body" id="body-${id}"></div>`;
  rightContent.appendChild(el);
}
function getSectionBody(id) { return document.getElementById('body-' + id); }
function setSectionBadge(id, text, type) {
  const b = document.getElementById('badge-' + id);
  if (b) { b.textContent = text; b.className = 'stage-badge badge-' + type; }
}
function openSection(id) {
  const body = document.getElementById('body-' + id);
  const chev = document.getElementById('chev-' + id);
  const hdr  = document.querySelector('#stage-' + id + ' .stage-header');
  if (body) { body.classList.add('open'); body.style.display = 'block'; }
  if (chev) { chev.classList.add('open'); chev.textContent = '▼'; }
  if (hdr)  hdr.classList.add('open');

  // Scroll the right-content panel so this stage is always visible
  const stageEl = document.getElementById('stage-' + id);
  if (stageEl) {
    requestAnimationFrame(() => {
      stageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}
window.toggleSection = function(id) {
  const body = document.getElementById('body-' + id);
  const chev = document.getElementById('chev-' + id);
  const hdr  = document.querySelector('#stage-' + id + ' .stage-header');
  if (!body) return;
  const isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  if (chev) chev.textContent = isOpen ? '▶' : '▼';
  if (hdr)  hdr.classList.toggle('open', !isOpen);
};

// Jump to a stage — expand it and scroll it into view
window.jumpToStage = function(id) {
  openSection(id);
  const el = document.getElementById('stage-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Show / hide the step-nav bar
function showStepNav(show) {
  const nav = document.getElementById('stepNav');
  if (nav) nav.style.display = show ? 'flex' : 'none';
}

// Collapse / Expand All
document.getElementById('btnCollapseAll').addEventListener('click', () => {
  document.querySelectorAll('.stage-body').forEach(b => {
    b.style.display = 'none';
    const id = b.id.replace('body-', '');
    const chev = document.getElementById('chev-' + id);
    const hdr  = document.querySelector('#stage-' + id + ' .stage-header');
    if (chev) chev.textContent = '▶';
    if (hdr)  hdr.classList.remove('open');
  });
});
document.getElementById('btnExpandAll').addEventListener('click', () => {
  document.querySelectorAll('.stage-body').forEach(b => {
    b.style.display = 'block';
    const id = b.id.replace('body-', '');
    const chev = document.getElementById('chev-' + id);
    const hdr  = document.querySelector('#stage-' + id + ' .stage-header');
    if (chev) chev.textContent = '▼';
    if (hdr)  hdr.classList.add('open');
  });
});

// ── Chat helpers ───────────────────────────────
function appendBubble(classes, text) {
  const d = document.createElement('div');
  d.className = 'chat-bubble ' + classes;
  d.textContent = text;
  chatMessages.appendChild(d);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return d;
}

// ── Utility ────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function err(msg) { return `<div style="color:var(--red);font-size:13px">⚠️ ${escHtml(msg)}</div>`; }

function showToast(msg, type='') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Init ───────────────────────────────────────
refreshStats();
setInterval(refreshStats, 15000);
