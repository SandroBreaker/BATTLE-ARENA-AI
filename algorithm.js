/**
 * ALGORITHM.JS
 * Responsável pura e unicamente pela lógica de avaliação do código string.
 * Retorna um objeto com pontuações e feedbacks.
 */

class CodeBattleArbiter {
    constructor() {
        this.weights = {
            html: 0.30,
            css: 0.35,
            js: 0.35
        };
    }

    /**
     * Avalia uma string de código HTML completa (incluindo <style> e <script>)
     * @param {string} rawHTML 
     * @returns {object} { total, breakdown: {html, css, js}, feedback: [] }
     */
    evaluate(rawHTML) {
        if (!rawHTML || typeof rawHTML !== 'string') {
            return this._getErrorResult();
        }

        const scores = { html: 50, css: 50, js: 50 }; // Pontuação base
        const feedback = [];

        // --- 1. Análise HTML ---
        // Bônus
        if (/<!DOCTYPE html>/i.test(rawHTML)) { scores.html += 10; feedback.push({ type: 'good', msg: 'HTML: Doctype declarado corretamente.' }); }
        if (/<meta name=["']viewport["']/i.test(rawHTML)) { scores.html += 10; feedback.push({ type: 'good', msg: 'HTML: Meta Viewport (Mobile Friendly).' }); }
        if (/<(main|article|section|header|footer|nav|aside)/i.test(rawHTML)) { scores.html += 15; feedback.push({ type: 'good', msg: 'HTML: Uso de tags semânticas modernas.' }); }
        if (/aria-|role=/i.test(rawHTML)) { scores.html += 10; feedback.push({ type: 'good', msg: 'HTML: Atributos de Acessibilidade (ARIA) encontrados.' }); }
        
        // Penalidades
        if (/onclick=/i.test(rawHTML)) { scores.html -= 15; feedback.push({ type: 'bad', msg: 'HTML: JS Inline (onclick) detectado. Má prática.' }); }
        if (/<font|<center|<br>/i.test(rawHTML)) { scores.html -= 10; feedback.push({ type: 'bad', msg: 'HTML: Uso de tags obsoletas/layout antigo.' }); }


        // --- 2. Análise CSS ---
        // Tenta extrair CSS (dentro de style ou geral)
        const cssContent = (rawHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/i) || [])[1] || "";
        
        // Bônus
        if (/:root/i.test(cssContent)) { scores.css += 15; feedback.push({ type: 'good', msg: 'CSS: Uso de Variáveis (:root).' }); }
        if (/@media/i.test(cssContent)) { scores.css += 15; feedback.push({ type: 'good', msg: 'CSS: Responsividade (@media queries).' }); }
        if (/display:\s*(flex|grid)/i.test(cssContent)) { scores.css += 15; feedback.push({ type: 'good', msg: 'CSS: Layout Moderno (Flexbox/Grid).' }); }
        if (/animation:|transition:/i.test(cssContent)) { scores.css += 10; feedback.push({ type: 'good', msg: 'CSS: Animações nativas.' }); }
        if (/backdrop-filter|linear-gradient/i.test(cssContent)) { scores.css += 5; feedback.push({ type: 'good', msg: 'CSS: Estilização visual avançada.' }); }

        // Penalidades
        const inlineStyles = (rawHTML.match(/style=["'][^"']*["']/g) || []).length;
        if (inlineStyles > 3) { scores.css -= 15; feedback.push({ type: 'bad', msg: `CSS: Excesso de estilos inline (${inlineStyles} tags).` }); }


        // --- 3. Análise JS ---
        // Tenta extrair JS
        const jsContent = (rawHTML.match(/<script[^>]*>([\s\S]*?)<\/script>/i) || [])[1] || "";

        // Bônus
        if (/(const|let)\s/i.test(jsContent)) { scores.js += 10; feedback.push({ type: 'good', msg: 'JS: Declaração de variáveis moderna (ES6).' }); }
        if (/=>|class\s/i.test(jsContent)) { scores.js += 15; feedback.push({ type: 'good', msg: 'JS: Sintaxe moderna (Arrow Functions/Classes).' }); }
        if (/\.addEventListener/i.test(jsContent)) { scores.js += 15; feedback.push({ type: 'good', msg: 'JS: Manipulação de eventos segura.' }); }
        if (/try\s*{|catch/i.test(jsContent)) { scores.js += 10; feedback.push({ type: 'good', msg: 'JS: Tratamento de erros detectado.' }); }
        if (/querySelector|getElementById/i.test(jsContent)) { scores.js += 5; feedback.push({ type: 'good', msg: 'JS: Manipulação de DOM padrão.' }); }

        // Penalidades
        if (/var\s/i.test(jsContent)) { scores.js -= 10; feedback.push({ type: 'neutral', msg: 'JS: Uso de "var" (prefira let/const).' }); }
        if (/alert\(/i.test(jsContent)) { scores.js -= 10; feedback.push({ type: 'bad', msg: 'JS: Uso de alert() (UX pobre).' }); }
        if (jsContent.length < 50 && rawHTML.length > 500) { scores.js = 10; feedback.push({ type: 'neutral', msg: 'JS: Pouca ou nenhuma lógica detectada.' }); }

        // Normalização (0 a 100)
        scores.html = this._clamp(scores.html);
        scores.css = this._clamp(scores.css);
        scores.js = this._clamp(scores.js);

        // Média Ponderada
        const total = Math.round(
            (scores.html * this.weights.html) +
            (scores.css * this.weights.css) +
            (scores.js * this.weights.js)
        );

        return {
            total,
            breakdown: scores,
            feedback
        };
    }

    _clamp(num) {
        return Math.min(100, Math.max(0, num));
    }

    _getErrorResult() {
        return {
            total: 0,
            breakdown: { html: 0, css: 0, js: 0 },
            feedback: [{ type: 'bad', msg: 'Erro: Código não pôde ser lido ou está vazio.' }]
        };
    }
}