document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = `${item.dataset.view}-view`;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                if (view.id === viewId) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            });
        });
    });

    // Chat Functionality
    const queryInput = document.getElementById('query-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const sourcesList = document.getElementById('sources-list');

    const API_BASE_URL = 'http://localhost:8000/api';

    async function sendQuery() {
        const query = queryInput.value.trim();
        if (!query) return;

        // Add user message
        addMessage(query, 'user-message', '👤');
        queryInput.value = '';

        // Show loading state
        const loadingId = addMessage('Thinking...', 'ai-message', '🤖');

        try {
            const response = await fetch(`${API_BASE_URL}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query, top_k: 5 })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            
            // Update message with answer
            updateMessage(loadingId, data.answer);
            
            // Update sources
            updateSources(data.sources);
        } catch (error) {
            updateMessage(loadingId, `Error: Could not reach the API. Make sure the backend is running. (${error.message})`);
        }
    }

    sendBtn.addEventListener('click', sendQuery);
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuery();
    });

    function addMessage(text, className, avatarStr) {
        const id = 'msg-' + Date.now();
        const msgHtml = `
            <div class="message ${className}" id="${id}">
                <div class="avatar">${avatarStr}</div>
                <div class="content">${escapeHtml(text)}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function updateMessage(id, text) {
        const msgEl = document.getElementById(id);
        if (msgEl) {
            msgEl.querySelector('.content').innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateSources(sources) {
        if (!sources || sources.length === 0) {
            sourcesList.innerHTML = '<div class="empty-state">No sources retrieved.</div>';
            return;
        }

        sourcesList.innerHTML = sources.map(src => `
            <div class="source-card">
                <div class="source-meta">
                    <span>${src.metadata.type || 'Unknown'}</span>
                    <span class="source-score">Score: ${src.score.toFixed(3)}</span>
                </div>
                <div class="source-text">${escapeHtml(src.text)}</div>
            </div>
        `).join('');
    }

    // Ingestion Functionality
    const ingestBtn = document.getElementById('ingest-btn');
    const ingestText = document.getElementById('ingest-text');
    const ingestStatus = document.getElementById('ingest-status');

    ingestBtn.addEventListener('click', async () => {
        const text = ingestText.value.trim();
        if (!text) return;

        ingestBtn.disabled = true;
        ingestBtn.textContent = 'Ingesting...';
        ingestStatus.textContent = '';

        try {
            const url = new URL(`${API_BASE_URL}/ingest/text`);
            url.searchParams.append('text', text);
            url.searchParams.append('source_type', 'manual_input');
            url.searchParams.append('source_name', 'Web UI');

            const response = await fetch(url, { method: 'POST' });
            
            if (!response.ok) throw new Error('Ingestion failed');
            
            ingestText.value = '';
            ingestStatus.textContent = 'Successfully ingested text into vector database!';
            ingestStatus.style.color = 'var(--success)';
        } catch (error) {
            ingestStatus.textContent = `Error: ${error.message}`;
            ingestStatus.style.color = '#ef4444'; // Red
        } finally {
            ingestBtn.disabled = false;
            ingestBtn.textContent = 'Ingest Context';
        }
    });

    // File Upload Functionality
    const uploadBtn = document.getElementById('upload-file-btn');
    const fileInput = document.getElementById('file-input');
    const fileSourceType = document.getElementById('file-source-type');
    const fileUploadStatus = document.getElementById('file-upload-status');

    uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            fileUploadStatus.textContent = 'Please select a file first.';
            fileUploadStatus.style.color = '#ef4444';
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        fileUploadStatus.textContent = '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_type', fileSourceType.value);

        try {
            const response = await fetch(`${API_BASE_URL}/ingest/file`, { 
                method: 'POST',
                body: formData 
            });
            
            const data = await response.json();

            if (!response.ok) throw new Error(data.detail || 'Upload failed');
            
            fileInput.value = '';
            fileUploadStatus.textContent = data.message || 'Successfully uploaded and ingested file!';
            fileUploadStatus.style.color = 'var(--success)';
        } catch (error) {
            fileUploadStatus.textContent = `Error: ${error.message}`;
            fileUploadStatus.style.color = '#ef4444'; // Red
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload File';
        }
    });

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
