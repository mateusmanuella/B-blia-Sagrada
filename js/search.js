// search.js - Sistema de busca funcional para a Bíblia
class BibleSearch {
    constructor() {
        this.verses = this.loadBibleData();
        this.books = this.loadBooksData();
        this.characters = this.loadCharactersData();
        this.themes = this.loadThemesData();
        this.init();
    }

    init() {
        this.setupSearchHandlers();
        console.log('🔍 Sistema de busca bíblica inicializado!');
    }

    loadBibleData() {
        return [
            {
                book: "Gênesis",
                chapter: 1,
                verse: 1,
                text: "No princípio, Deus criou os céus e a terra.",
                version: "NVI"
            },
            {
                book: "João",
                chapter: 3,
                verse: 16,
                text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
                version: "NVI"
            },
            {
                book: "Salmos",
                chapter: 23,
                verse: 1,
                text: "O Senhor é o meu pastor; de nada terei falta.",
                version: "NVI"
            },
            {
                book: "Filipenses",
                chapter: 4,
                verse: 13,
                text: "Tudo posso naquele que me fortalece.",
                version: "NVI"
            },
            {
                book: "Jeremias",
                chapter: 29,
                verse: 11,
                text: "Porque eu sei os planos que tenho para vocês', declara o Senhor, 'planos de prosperá-los e não de causar dano, planos de dar-lhes esperança e um futuro.",
                version: "NVI"
            },
            {
                book: "Romanos",
                chapter: 8,
                verse: 28,
                text: "Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.",
                version: "NVI"
            },
            {
                book: "Isaías",
                chapter: 41,
                verse: 10,
                text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
                version: "ARA"
            },
            {
                book: "Mateus",
                chapter: 11,
                verse: 28,
                text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.",
                version: "NVI"
            },
            {
                book: "Provérbios",
                chapter: 3,
                verse: 5,
                text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento;",
                version: "NVI"
            },
            {
                book: "2 Coríntios",
                chapter: 5,
                verse: 17,
                text: "Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!",
                version: "NVI"
            }
        ];
    }

    loadBooksData() {
        return [
            { name: "Gênesis", testament: "AT", chapters: 50, theme: "Criação, Patriarcas" },
            { name: "Êxodo", testament: "AT", chapters: 40, theme: "Libertação, Lei" },
            { name: "Salmos", testament: "AT", chapters: 150, theme: "Louvor, Oração" },
            { name: "Isaías", testament: "AT", chapters: 66, theme: "Profecia, Messias" },
            { name: "Mateus", testament: "NT", chapters: 28, theme: "Evangelho, Reino" },
            { name: "João", testament: "NT", chapters: 21, theme: "Evangelho, Vida" },
            { name: "Romanos", testament: "NT", chapters: 16, theme: "Doutrina, Graça" },
            { name: "Apocalipse", testament: "NT", chapters: 22, theme: "Profecia, Fim" }
        ];
    }

    loadCharactersData() {
        return [
            { name: "Jesus", role: "Filho de Deus", books: ["Mateus", "Marcos", "Lucas", "João"] },
            { name: "Moisés", role: "Líder, Profeta", books: ["Êxodo", "Levítico", "Números", "Deuteronômio"] },
            { name: "Davi", role: "Rei, Salmista", books: ["1 Samuel", "2 Samuel", "Salmos"] },
            { name: "Paulo", role: "Apóstolo", books: ["Romanos", "1 Coríntios", "2 Coríntios", "Gálatas"] },
            { name: "Maria", role: "Mãe de Jesus", books: ["Mateus", "Lucas", "João"] },
            { name: "Pedro", role: "Apóstolo", books: ["Mateus", "Marcos", "Lucas", "João", "Atos"] }
        ];
    }

    loadThemesData() {
        return [
            { theme: "Amor", verses: ["João 3:16", "1 Coríntios 13", "1 João 4:8"] },
            { theme: "Fé", verses: ["Hebreus 11:1", "Romanos 10:17", "Efésios 2:8"] },
            { theme: "Esperança", verses: ["Jeremias 29:11", "Romanos 15:13", "1 Pedro 1:3"] },
            { theme: "Salvação", verses: ["Efésios 2:8-9", "Romanos 10:9", "João 14:6"] },
            { theme: "Oração", verses: ["Filipenses 4:6", "1 Tessalonicenses 5:17", "Tiago 5:16"] }
        ];
    }

    setupSearchHandlers() {
        const searchInput = document.getElementById('gallery-search');
        const clearBtn = document.getElementById('gallery-clear');
        const searchCount = document.getElementById('search-count');

        if (!searchInput) {
            console.error('❌ Campo de pesquisa não encontrado!');
            return;
        }

        // Busca em tempo real
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.performSearch(query);
        });

        // Botão limpar
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.clearSearch();
                if (searchCount) searchCount.textContent = '';
            });
        }

        // Tecla Enter para buscar
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(searchInput.value.trim());
            }
        });

        console.log('✅ Handlers de busca configurados!');
    }

    performSearch(query) {
        if (!query) {
            this.clearSearch();
            return;
        }

        const results = {
            verses: this.searchVerses(query),
            books: this.searchBooks(query),
            characters: this.searchCharacters(query),
            themes: this.searchThemes(query)
        };

        this.highlightResults(results, query);
        this.updateSearchCount(results, query);
    }

    searchVerses(query) {
        return this.verses.filter(verse => {
            const searchText = `${verse.book} ${verse.text} ${verse.version}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }

    searchBooks(query) {
        return this.books.filter(book => {
            return book.name.toLowerCase().includes(query.toLowerCase()) ||
                   book.theme.toLowerCase().includes(query.toLowerCase());
        });
    }

    searchCharacters(query) {
        return this.characters.filter(character => {
            const searchText = `${character.name} ${character.role} ${character.books.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }

    searchThemes(query) {
        return this.themes.filter(theme => {
            return theme.theme.toLowerCase().includes(query.toLowerCase()) ||
                   theme.verses.some(verse => verse.toLowerCase().includes(query.toLowerCase()));
        });
    }

    highlightResults(results, query) {
        // Remover highlights anteriores
        this.clearSearch();

        // Combinar todos os resultados
        const allResults = [
            ...results.verses.map(v => ({ type: 'verse', data: v })),
            ...results.books.map(b => ({ type: 'book', data: b })),
            ...results.characters.map(c => ({ type: 'character', data: c })),
            ...results.themes.map(t => ({ type: 'theme', data: t }))
        ];

        // Encontrar e destacar elementos na página
        allResults.forEach(result => {
            this.highlightElement(result, query);
        });

        // Rolar para o primeiro resultado se houver
        const firstHighlight = document.querySelector('.search-highlight');
        if (firstHighlight) {
            setTimeout(() => {
                firstHighlight.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }

    highlightElement(result, query) {
        const { type, data } = result;
        
        let selector, searchText;
        
        switch (type) {
            case 'verse':
                selector = `.gallery-card, .info-card, .card`;
                searchText = data.book.toLowerCase();
                break;
            case 'book':
                selector = `.gallery-card, .info-card, .card`;
                searchText = data.name.toLowerCase();
                break;
            case 'character':
                selector = `.gallery-card[data-title="${data.name}"], .card h5`;
                searchText = data.name.toLowerCase();
                break;
            case 'theme':
                selector = `.gallery-card, .info-card`;
                searchText = data.theme.toLowerCase();
                break;
        }

        // Encontrar elementos que correspondem
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const elementText = element.textContent.toLowerCase();
            const elementTitle = element.getAttribute('data-title') || 
                               element.querySelector('h5')?.textContent || 
                               element.querySelector('.gallery-caption')?.textContent || '';
            
            if (elementText.includes(query.toLowerCase()) || 
                elementTitle.toLowerCase().includes(query.toLowerCase()) ||
                elementTitle.toLowerCase().includes(searchText)) {
                
                element.classList.add('search-highlight');
                
                // Adicionar efeito LED para cards
                if (element.classList.contains('card-led')) {
                    element.style.setProperty('--led-intensity', '0.8');
                    element.style.boxShadow = '0 0 25px rgba(249, 211, 66, 0.6)';
                }
            }
        });
    }

    updateSearchCount(results, query) {
        const searchCount = document.getElementById('search-count');
        if (!searchCount) return;

        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        
        if (totalResults > 0) {
            searchCount.textContent = `${totalResults} resultado(s) para "${query}"`;
            searchCount.style.color = 'var(--accent)';
        } else {
            searchCount.textContent = `Nenhum resultado para "${query}"`;
            searchCount.style.color = 'var(--danger)';
        }
    }

    clearSearch() {
        // Remover todos os highlights
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
            if (el.classList.contains('card-led')) {
                el.style.setProperty('--led-intensity', '0.3');
                el.style.boxShadow = '';
            }
        });

        // Limpar contador
        const searchCount = document.getElementById('search-count');
        if (searchCount) {
            searchCount.textContent = '';
        }
    }
}

// Inicialização simplificada
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.bibleSearch = new BibleSearch();
        console.log('✅ Busca bíblica carregada e funcionando!');
        
        // Adicionar CSS para os highlights se não existir
        if (!document.getElementById('search-highlight-css')) {
            const css = `
                <style id="search-highlight-css">
                .search-highlight {
                    outline: 3px solid var(--accent) !important;
                    box-shadow: 0 0 20px rgba(249, 211, 66, 0.4) !important;
                    transform: scale(1.02) !important;
                    transition: all 0.3s ease !important;
                    z-index: 10 !important;
                    position: relative !important;
                    animation: pulse-highlight 2s infinite !important;
                }
                
                @keyframes pulse-highlight {
                    0% { 
                        box-shadow: 0 0 10px rgba(249, 211, 66, 0.4); 
                        transform: scale(1.02);
                    }
                    50% { 
                        box-shadow: 0 0 25px rgba(249, 211, 66, 0.8); 
                        transform: scale(1.03);
                    }
                    100% { 
                        box-shadow: 0 0 10px rgba(249, 211, 66, 0.4); 
                        transform: scale(1.02);
                    }
                }
                
                #search-count {
                    font-weight: bold;
                    font-size: 0.9rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', css);
        }
    }, 500);
});