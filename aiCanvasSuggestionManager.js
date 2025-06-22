import api from './restApiClient.js';
import { renderModal, closeModal } from './modalManager.js';
import { onSectionEdit } from './canvasEditorHistory.js';

export async function openAiCanvasSuggestionManager(ideaId) {
  // Create container with loading state
  const container = document.createElement('div');
  container.classList.add('ai-suggestion-list');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-busy', 'true');

  const loadingEl = document.createElement('p');
  loadingEl.textContent = 'Loading suggestions...';
  container.appendChild(loadingEl);

  // Render modal and set basic ARIA roles
  const modal = renderModal('AI Suggestions', container);
  if (modal && modal.setAttribute) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
  }

  try {
    const [canvas, feedback] = await Promise.all([
      api.get(`/ideas/${ideaId}/canvas`),
      api.get(`/ideas/${ideaId}/feedback`)
    ]);
    const suggestions = await api.post('/ai/suggest', { canvas, feedback });

    // Clear loading state
    container.innerHTML = '';
    container.setAttribute('aria-busy', 'false');

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.classList.add('ai-suggestion-item');

        const textEl = document.createElement('p');
        textEl.textContent = suggestion.text;

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.textContent = 'Apply';
        const sectionId = suggestion.sectionId || null;
        applyBtn.setAttribute(
          'aria-label',
          suggestion.sectionId
            ? `Apply suggestion to section ${sectionId}`
            : 'Apply suggestion'
        );
        applyBtn.addEventListener('click', () => {
          onSectionEdit(sectionId, suggestion.text);
          closeModal();
        });

        item.append(textEl, applyBtn);
        container.appendChild(item);
      });
      const firstBtn = container.querySelector('button');
      if (firstBtn) firstBtn.focus();
    } else {
      const emptyEl = document.createElement('p');
      emptyEl.textContent = 'No suggestions available.';
      container.appendChild(emptyEl);
    }
  } catch (error) {
    console.error('AI Suggestions Error:', error);
    container.innerHTML = '';
    container.setAttribute('aria-busy', 'false');
    const errorEl = document.createElement('p');
    errorEl.textContent = 'Unable to load AI suggestions at this time.';
    container.appendChild(errorEl);
  }
}