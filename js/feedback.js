// feedback.js - Sistema de Feedback profissional (OTIMIZADO)
class FeedbackSystem {
  constructor() {
    this.storageKey = 'feedback.responses.v2';
    this.endpointKey = 'feedback.endpoint';
    this.adminPass = 'admin2025';
    this.questions = this.getQuestions();
    this.init();
  }

  init() {
    this.renderQuestions();
    this.setupFormHandling();
    this.setupAdminPanel();
    this.loadEndpoint();
  }

  getQuestions() {
    return [
      {
        id: 1,
        text: '1. O site é fácil de navegar?',
        options: [
          "Sim — muito fácil de encontrar o que procuro",
          "Relativamente fácil",
          "Algumas partes confusas",
          "Não encontrei o que precisava"
        ]
      },
      {
        id: 2,
        text: '2. As imagens carregam corretamente?',
        options: [
          "Todas as imagens carregaram",
          "Quase todas carregaram",
          "Algumas demoraram",
          "Muitas não carregaram"
        ]
      },
      {
        id: 3,
        text: '3. O conteúdo é informativo?',
        options: [
          "Sim — conteúdo relevante e claro",
          "Em boa parte útil",
          "Parcialmente útil",
          "Não achei informativo"
        ]
      },
      {
        id: 4,
        text: '4. O design é agradável?',
        options: [
          "Sim — visual agradável e limpo",
          "Design aceitável",
          "Pode melhorar",
          "Não gostei do visual"
        ]
      },
      {
        id: 5,
        text: '5. Os títulos estão claros?',
        options: [
          "Sim — títulos objetivos",
          "Em parte claros",
          "Alguns são confusos",
          "Títulos pouco descritivos"
        ]
      },
      {
        id: 6,
        text: '6. Você encontrou erros de ortografia?',
        options: [
          "Não encontrei erros",
          "Alguns erros pontuais",
          "Vários erros",
          "Muitos erros"
        ]
      },
      {
        id: 7,
        text: '7. O vídeo é relevante?',
        options: [
          "Sim — vídeo relevante para o tema",
          "Interessante, mas curto",
          "Pouco relevante",
          "Não assisti/irrelevante"
        ]
      },
      {
        id: 8,
        text: '8. A busca funcionou bem?',
        options: [
          "Sim — busca retornou bons resultados",
          "Funciona na maior parte",
          "Resultados imprecisos",
          "Busca não ajudou"
        ]
      },
      {
        id: 9,
        text: '9. Os cartões "Leia mais" ajudaram?',
        options: [
          "Sim — ajudaram a entender melhor",
          "Foram úteis parcialmente",
          "Pouco úteis",
          "Não foram úteis"
        ]
      },
      {
        id: 10,
        text: '10. A leitura no celular foi confortável?',
        options: [
          "Sim — ótima leitura no celular",
          "Boa leitura, com pequenas falhas",
          "Algumas dificuldades",
          "Muito desconfortável"
        ]
      },
      {
        id: 11,
        text: '11. Você recomendaria o site?',
        options: [
          "Sim — recomendaria a outros",
          "Talvez recomende",
          "Raramente recomendaria",
          "Não recomendaria"
        ]
      },
      {
        id: 12,
        text: '12. Qual a probabilidade de retornar ao site?',
        options: [
          "Muito provável (voltarei)",
          "Provável",
          "Pouco provável",
          "Não voltarei"
        ]
      }
    ];
  }

  renderQuestions() {
    const container = document.getElementById('questions');
    if (!container) return;

    container.innerHTML = this.questions.map(question => `
      <div class="question mb-4">
        <label class="form-label fw-bold">${question.text}</label>
        ${question.options.map((option, index) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="q${question.id}" 
                   id="q${question.id}_${index}" value="${BibleUtils.escapeHtml(option)}"
                   required>
            <label class="form-check-label" for="q${question.id}_${index}">
              ${String.fromCharCode(65 + index)}. ${option}
            </label>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  setupFormHandling() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitFeedback();
    });

    document.getElementById('clear-form')?.addEventListener('click', () => {
      form.reset();
      window.bibleApp.showToast('Formulário limpo', 'info');
    });
  }

  async submitFeedback() {
    const formData = this.collectFormData();
    
    if (!this.validateForm(formData)) {
      window.bibleApp.showToast('Por favor, responda todas as questões', 'warning');
      return;
    }

    try {
      this.saveToLocalStorage(formData);
      
      const endpoint = localStorage.getItem(this.endpointKey);
      if (endpoint) {
        await this.sendToEndpoint(formData, endpoint);
      } else {
        window.bibleApp.showToast('Feedback salvo localmente! Obrigado!', 'success');
      }

      document.getElementById('feedback-form').reset();
      window.bibleApp.trackEvent('feedback', 'submitted', 'form');

    } catch (error) {
      console.error('Erro no feedback:', error);
      window.bibleApp.showToast('Erro ao enviar feedback', 'error');
    }
  }

  collectFormData() {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      answers: {},
      freeText: document.getElementById('freeText')?.value || ''
    };

    this.questions.forEach(question => {
      const selected = document.querySelector(`input[name="q${question.id}"]:checked`);
      data.answers[`q${question.id}`] = selected ? selected.value : null;
    });

    return data;
  }

  validateForm(data) {
    return this.questions.every(question => data.answers[`q${question.id}`] !== null);
  }

  saveToLocalStorage(data) {
    const stored = this.getStoredResponses();
    stored.push(data);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      console.warn('Erro ao salvar localmente:', error);
      const minimalData = { ...data, userAgent: '', screenResolution: '' };
      localStorage.setItem(this.storageKey, JSON.stringify([minimalData]));
    }
  }

  getStoredResponses() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (error) {
      console.error('Erro ao ler respostas:', error);
      return [];
    }
  }

  async sendToEndpoint(data, endpoint) {
    const formData = new URLSearchParams();
    
    formData.append('timestamp', data.timestamp);
    formData.append('freeText', data.freeText);
    formData.append('userAgent', data.userAgent);
    formData.append('screenResolution', data.screenResolution);

    Object.entries(data.answers).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    window.bibleApp.showToast('Feedback enviado com sucesso!', 'success');
  }

  setupAdminPanel() {
    this.setupEndpointManagement();
    this.setupAdminAuth();
  }

  setupEndpointManagement() {
    const endpointInput = document.getElementById('external-endpoint');
    const saveEndpointBtn = document.getElementById('save-endpoint');

    if (endpointInput && saveEndpointBtn) {
      saveEndpointBtn.addEventListener('click', () => {
        const value = endpointInput.value.trim();
        
        try {
          if (value) {
            new URL(value);
            localStorage.setItem(this.endpointKey, value);
            window.bibleApp.showToast('Endpoint salvo com sucesso', 'success');
          } else {
            localStorage.removeItem(this.endpointKey);
            window.bibleApp.showToast('Endpoint removido', 'info');
          }
        } catch (error) {
          window.bibleApp.showToast('URL inválida', 'error');
        }
      });
    }
  }

  loadEndpoint() {
    const endpointInput = document.getElementById('external-endpoint');
    if (endpointInput) {
      endpointInput.value = localStorage.getItem(this.endpointKey) || '';
    }
  }

  setupAdminAuth() {
    const adminLogin = document.getElementById('admin-login');
    const adminLogout = document.getElementById('admin-logout');
    
    if (adminLogin) {
      adminLogin.addEventListener('click', () => this.handleAdminLogin());
    }
    
    if (adminLogout) {
      adminLogout.addEventListener('click', () => this.handleAdminLogout());
    }
  }

  handleAdminLogin() {
    const password = document.getElementById('admin-pass')?.value;
    const adminPanel = document.getElementById('admin-panel');
    
    if (password === this.adminPass && adminPanel) {
      adminPanel.style.display = 'block';
      this.renderAdminResponses();
      window.bibleApp.showToast('Painel administrativo acessado', 'success');
    } else {
      window.bibleApp.showToast('Senha incorreta', 'error');
    }
  }

  handleAdminLogout() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
      adminPanel.style.display = 'none';
      document.getElementById('admin-pass').value = '';
    }
  }

  renderAdminResponses() {
    const container = document.getElementById('answers-list');
    const countElement = document.getElementById('count');
    const responses = this.getStoredResponses();
    
    if (!container) return;

    countElement.textContent = responses.length;

    if (responses.length === 0) {
      container.innerHTML = '<p class="text-muted">Nenhuma resposta registrada.</p>';
      return;
    }

    container.innerHTML = responses.map((response, index) => `
      <div class="response-item card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted">
            #${index + 1} - ${new Date(response.timestamp).toLocaleString('pt-BR')}
          </h6>
          <div class="response-answers">
            ${Object.entries(response.answers).map(([key, value]) => `
              <div><strong>${key}:</strong> ${value || '-'}</div>
            `).join('')}
          </div>
          ${response.freeText ? `
            <div class="mt-2">
              <strong>Comentário:</strong>
              <p class="text-muted">${BibleUtils.escapeHtml(response.freeText)}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  exportToCSV() {
    const responses = this.getStoredResponses();
    const headers = ['Timestamp', 'FreeText', ...this.questions.map(q => `Q${q.id}`)];
    
    const csvContent = [
      headers.join(','),
      ...responses.map(response => {
        const row = [
          response.timestamp,
          `"${(response.freeText || '').replace(/"/g, '""')}"`,
          ...this.questions.map(q => `"${(response.answers[`q${q.id}`] || '').replace(/"/g, '""')}"`)
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback-respostas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.bibleApp.trackEvent('admin', 'export', 'csv');
  }

  clearResponses() {
    if (confirm('Tem certeza que deseja apagar todas as respostas? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(this.storageKey);
      this.renderAdminResponses();
      window.bibleApp.showToast('Respostas apagadas', 'success');
      window.bibleApp.trackEvent('admin', 'clear', 'responses');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('feedback-form')) {
    window.feedbackSystem = new FeedbackSystem();
  }
});