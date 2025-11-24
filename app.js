/**
 * APP.JS
 * Controlador de Interação e Dados.
 * 1. Define a lista de arquivos externos.
 * 2. Busca o conteúdo (Fetch).
 * 3. Usa Algorithm.js para pontuar.
 * 4. Renderiza a UI.
 */

// CONFIGURAÇÃO: Liste seus arquivos HTML aqui
// Certifique-se de que esses arquivos existem na mesma pasta que o index.html
const TARGET_FILES = [
    { filename: 'file1.html', label: "Amostra #1 (Canvas Rain)" },
    { filename: 'file2.html', label: "Amostra #2 (Acessível/SVG)" },
    { filename: 'file3.html', label: "Amostra #3 (Classes JS)" },
    { filename: 'file4.html', label: "Amostra #4 (Mobile/Touch)" },
    { filename: 'file5.html', label: "Amostra #5 (Simples)" },
    { filename: 'file6.html', label: "Amostra #6 (Legado)" }
];

const App = {
    arbiter: new CodeBattleArbiter(),
    
    init() {
        this.grid = document.getElementById('cards-grid');
        this.overlay = document.getElementById('preview-overlay');
        this.iframe = document.getElementById('preview-frame');
        
        // Event Listeners
        document.getElementById('close-btn').addEventListener('click', () => this.closePreview());
        this.overlay.addEventListener('click', (e) => {
            if(e.target === this.overlay) this.closePreview();
        });

        // Iniciar Processo
        this.loadAndAnalyzeFiles();
    },

    async loadAndAnalyzeFiles() {
        this.grid.innerHTML = '';
        
        // Verificar se Algorithm.js foi carregado
        if (!window.CodeBattleArbiter) {
            this.grid.innerHTML = '<p class="error">Erro crítico: Algorithm.js não encontrado.</p>';
            return;
        }

        let loadedCount = 0;

        for (const [index, file] of TARGET_FILES.entries()) {
            try {
                // Fetch do conteúdo do arquivo HTML
                const response = await fetch(file.filename);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const codeText = await response.text();
                
                // Analisar usando o Algorithm.js
                const analysis = this.arbiter.evaluate(codeText);
                
                // Renderizar Card
                this.createCard(file, analysis, index, codeText);
                loadedCount++;

            } catch (error) {
                console.error(`Falha ao carregar ${file.filename}:`, error);
                this.createErrorCard(file, error);
            }
        }

        if (loadedCount === 0) {
            const warning = document.createElement('div');
            warning.className = 'error-banner';
            warning.innerHTML = `
                <h3>Nenhum arquivo carregado</h3>
                <p>Certifique-se de estar rodando via Servidor Local (http://localhost...) e não arquivo direto (file://).</p>
                <p>Verifique se os arquivos (file1.html, etc) existem na pasta.</p>
            `;
            this.grid.appendChild(warning);
        }
    },

    createCard(fileInfo, analysis, index, rawCode) {
        const card = document.createElement('div');
        card.className = 'ai-card';
        card.style.animationDelay = `${index * 0.1}s`; // Stagger animation

        // Tags baseadas na pontuação
        let badge = '';
        if (analysis.total >= 90) badge = '<span class="rank-badge gold">OURO</span>';
        else if (analysis.total >= 70) badge = '<span class="rank-badge silver">PRATA</span>';
        else badge = '<span class="rank-badge bronze">BRONZE</span>';

        card.innerHTML = `
            <div class="card-header">
                ${badge}
                <h3>${fileInfo.label}</h3>
                <code class="filename">${fileInfo.filename}</code>
            </div>
            
            <div class="score-display">
                <div class="score-ring ${this.getScoreColor(analysis.total)}">
                    <span>${analysis.total}</span>
                </div>
                <div class="mini-stats">
                    <div class="stat"><span>HTML</span> <div class="bar"><div style="width:${analysis.breakdown.html}%"></div></div></div>
                    <div class="stat"><span>CSS</span> <div class="bar"><div style="width:${analysis.breakdown.css}%"></div></div></div>
                    <div class="stat"><span>JS</span> <div class="bar"><div style="width:${analysis.breakdown.js}%"></div></div></div>
                </div>
            </div>

            <button class="action-btn">Ver Demo & Análise</button>
        `;

        // Evento de Clique
        card.onclick = () => this.openPreview(fileInfo, analysis, rawCode);

        this.grid.appendChild(card);
    },

    createErrorCard(fileInfo, error) {
        const card = document.createElement('div');
        card.className = 'ai-card error-state';
        card.innerHTML = `
            <div class="card-header">
                <span class="rank-badge error">ERRO</span>
                <h3>${fileInfo.label}</h3>
            </div>
            <div class="error-msg">
                <p>Não foi possível ler <b>${fileInfo.filename}</b>.</p>
                <small>${error.message}</small>
            </div>
        `;
        this.grid.appendChild(card);
    },

    openPreview(fileInfo, analysis, rawCode) {
        // Preencher Modal
        document.getElementById('modal-title').textContent = fileInfo.label;
        const scorePill = document.getElementById('modal-score');
        scorePill.textContent = analysis.total;
        scorePill.className = `score-pill ${this.getScoreColor(analysis.total)}`;

        // Preencher Logs
        const logContainer = document.getElementById('analysis-log');
        logContainer.innerHTML = '';
        analysis.feedback.forEach(item => {
            const row = document.createElement('div');
            row.className = `log-row ${item.type}`;
            row.innerHTML = `<span class="bullet">•</span> ${item.msg}`;
            logContainer.appendChild(row);
        });

        // Carregar Iframe
        // Usamos src direto para o arquivo para garantir que assets relativos funcionem
        this.iframe.src = fileInfo.filename;

        // Mostrar Modal
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closePreview() {
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        setTimeout(() => {
            this.iframe.src = ''; // Limpar para parar sons/videos
        }, 300);
    },

    getScoreColor(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'med';
        return 'low';
    }
};

// Funções Globais para UI
window.setFrameWidth = (width) => {
    const frame = document.getElementById('preview-frame');
    frame.style.width = width;
    
    // Toggle active state
    document.querySelectorAll('.switch-btn').forEach(btn => {
        // Lógica simples baseada no SVG interno para identificar qual botão é qual
        // Mas a UI já funciona bem com o clique direto
        btn.classList.remove('active');
    });
    // Adiciona active no botão clicado (hack simples via event.currentTarget se fosse passado, 
    // mas aqui vamos deixar visualmente estático ou melhorar depois se necessário)
};


document.addEventListener('DOMContentLoaded', () => {
    App.init();
});