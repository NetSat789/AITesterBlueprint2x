document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileList = document.getElementById('fileList');
    const ingestBtn = document.getElementById('ingestBtn');
    const ingestStatus = document.getElementById('ingestStatus');
    const viewDbBtn = document.getElementById('viewDbBtn');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfContainer = document.getElementById('pdfContainer');
    const chunksContainer = document.getElementById('chunksContainer');
    const chunkCount = document.getElementById('chunkCount');
    const apiKeyInput = document.getElementById('apiKey');
    
    // Chat Elements
    const chatMessages = document.getElementById('chatMessages');
    const queryInput = document.getElementById('queryInput');
    const sendQueryBtn = document.getElementById('sendQueryBtn');
    
    // Flow Elements
    const flowEmpty = document.getElementById('flowEmpty');
    const stepQuery = document.getElementById('step-query');
    const stepEmbed = document.getElementById('step-embed');
    const stepRetrieve = document.getElementById('step-retrieve');
    const retrievedChunksBox = document.getElementById('retrievedChunksBox');
    const stepLlm = document.getElementById('step-llm');
    const stepAnswer = document.getElementById('step-answer');
    
    // Modal Elements
    const dbModal = document.getElementById('dbModal');
    const dbModalContent = document.getElementById('dbModalContent');
    const closeBtn = document.querySelector('.close-btn');

    let currentPdf = '';

    // Initialize: Fetch files and existing chunks
    fetchFiles();
    fetchDbChunks(true);

    async function fetchFiles() {
        try {
            const res = await fetch('/api/files');
            const data = await res.json();
            fileList.innerHTML = '';
            
            if (data.files && data.files.length > 0) {
                currentPdf = data.files[0];
                data.files.forEach(f => {
                    const li = document.createElement('li');
                    const icon = f.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-word';
                    const color = f.toLowerCase().endsWith('.pdf') ? '#ef4444' : '#3b82f6';
                    li.innerHTML = `<i class="fa-solid ${icon}" style="color: ${color}; margin-right: 5px;"></i> ${f}`;
                    fileList.appendChild(li);
                });
                
                // Show first PDF or document info
                if (currentPdf.toLowerCase().endsWith('.pdf')) {
                    pdfContainer.querySelector('.empty-state').classList.add('hidden');
                    pdfViewer.classList.remove('hidden');
                    pdfViewer.src = `/data/${currentPdf}`;
                } else {
                    // For DOCX files, show a document info card
                    pdfContainer.querySelector('.empty-state').innerHTML = `
                        <i class="fa-solid fa-file-word" style="color: #3b82f6;"></i>
                        <p><strong>${currentPdf}</strong></p>
                        <p style="font-size: 0.85rem;">Word document loaded. Click "Ingest to Chroma" to process.</p>
                    `;
                }
            } else {
                fileList.innerHTML = '<li>No documents found in data/ folder</li>';
                pdfContainer.querySelector('.empty-state').classList.remove('hidden');
                pdfViewer.classList.add('hidden');
            }
        } catch (error) {
            fileList.innerHTML = '<li class="status-error">Error connecting to server</li>';
        }
    }

    // Ingest Button
    ingestBtn.addEventListener('click', async () => {
        if (!currentPdf) {
            showStatus('Please place a PDF in the data folder first.', 'error');
            return;
        }

        ingestBtn.disabled = true;
        ingestBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        showStatus('Chunking and Embedding PDF...', '');
        
        try {
            const res = await fetch('/api/ingest', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                showStatus(data.message, 'success');
                // Fetch chunks to display
                fetchDbChunks(true);
            } else {
                showStatus(data.detail || 'Error during ingestion', 'error');
            }
        } catch (error) {
            showStatus('Network error during ingestion', 'error');
        } finally {
            ingestBtn.disabled = false;
            ingestBtn.innerHTML = '<i class="fa-solid fa-database"></i> Ingest to Chroma';
        }
    });

    function showStatus(msg, type) {
        ingestStatus.textContent = msg;
        ingestStatus.className = 'status-msg';
        if (type === 'success') ingestStatus.classList.add('status-success');
        if (type === 'error') ingestStatus.classList.add('status-error');
        ingestStatus.classList.remove('hidden');
        setTimeout(() => ingestStatus.classList.add('hidden'), 5000);
    }

    // Fetch and display DB chunks
    async function fetchDbChunks(updateMainPanel = false) {
        try {
            const res = await fetch('/api/database');
            const data = await res.json();
            
            if (data.chunks) {
                if (updateMainPanel) {
                    chunkCount.textContent = `${data.chunks.length} Chunks`;
                    renderChunks(data.chunks, chunksContainer);
                }
                renderChunks(data.chunks, dbModalContent);
            }
        } catch (error) {
            console.error("Error fetching DB", error);
        }
    }

    function renderChunks(chunks, container) {
        container.innerHTML = '';
        if (chunks.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Database is empty</p></div>';
            return;
        }

        chunks.forEach((chunk, index) => {
            const div = document.createElement('div');
            div.className = 'chunk-card';
            div.innerHTML = `
                <div class="chunk-id">ID: ${chunk.id.substring(0, 8)}... | Source: ${chunk.metadata.source ? chunk.metadata.source.split(/[\/\\]/).pop() : 'Unknown'} | Page: ${chunk.metadata.page || 0}</div>
                <div class="chunk-text">${chunk.content}</div>
            `;
            container.appendChild(div);
        });
    }

    // Modal logic
    viewDbBtn.addEventListener('click', () => {
        fetchDbChunks();
        dbModal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        dbModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === dbModal) dbModal.style.display = 'none';
    });

    // Chat Logic
    sendQueryBtn.addEventListener('click', handleQuery);
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuery();
    });

    async function handleQuery() {
        const query = queryInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        if (!query) return;
        if (!apiKey) {
            addMessage('System', 'Please enter your Groq API Key first.', 'system-msg');
            return;
        }

        // Add User Message
        addMessage('You', query, 'user-msg');
        queryInput.value = '';
        
        // Reset Flow Visualization
        resetFlow();
        flowEmpty.classList.add('hidden');
        
        // Start Flow Animation Sequence
        await animateFlowStep(stepQuery);
        
        try {
            await animateFlowStep(stepEmbed);
            await animateFlowStep(stepRetrieve);
            
            // Call API
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, api_key: apiKey })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // Show retrieved chunks in flow
                retrievedChunksBox.innerHTML = '';
                data.chunks.forEach((c, i) => {
                    const p = document.createElement('p');
                    p.textContent = `[Chunk ${i+1}] ${c.content.substring(0, 60)}...`;
                    retrievedChunksBox.appendChild(p);
                });
                
                await animateFlowStep(stepLlm);
                await animateFlowStep(stepAnswer);
                
                // Add Bot Message
                addMessage('NeuralRAG', data.answer, 'bot-msg');
            } else {
                addMessage('Error', data.detail || 'Failed to get answer', 'system-msg');
                flowEmpty.classList.remove('hidden');
                resetFlow();
            }
        } catch (error) {
            addMessage('Error', 'Network error connecting to API.', 'system-msg');
            flowEmpty.classList.remove('hidden');
            resetFlow();
        }
    }

    function addMessage(sender, text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        
        // Convert simple markdown-like syntax to HTML if needed or just use text
        const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
        div.innerHTML = `<div class="msg-content">${formattedText}</div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function resetFlow() {
        stepQuery.classList.add('hidden');
        stepEmbed.classList.add('hidden');
        stepRetrieve.classList.add('hidden');
        stepLlm.classList.add('hidden');
        stepAnswer.classList.add('hidden');
        retrievedChunksBox.innerHTML = '';
    }

    function animateFlowStep(element) {
        return new Promise(resolve => {
            element.classList.remove('hidden');
            // Simulate processing time for visualization
            setTimeout(resolve, 800);
        });
    }
});
