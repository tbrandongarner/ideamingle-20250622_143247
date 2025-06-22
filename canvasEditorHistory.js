import api from './restApiClient.js'
import { html, render } from './renderer.js'
import socket from './canvasWebSocketManager.js'

function throttle(fn, wait) {
  let last = 0, timeout
  return function(...args) {
    const now = Date.now()
    const remaining = wait - (now - last)
    clearTimeout(timeout)
    if (remaining <= 0) {
      last = now
      fn.apply(this, args)
    } else {
      timeout = setTimeout(() => {
        last = Date.now()
        fn.apply(this, args)
      }, remaining)
    }
  }
}

export function initCanvasEditorHistory(editorContainerId, historyContainerId, ideaId) {
  const editorContainer = document.getElementById(editorContainerId)
  const historyContainer = document.getElementById(historyContainerId)
  if (!editorContainer || !historyContainer) {
    console.error('Canvas editor or history container not found')
    return () => {}
  }

  function loadSections() {
    api.get(`/ideas/${ideaId}/sections`)
      .then(renderSections)
      .catch(err => {
        console.error('Error loading sections', err)
        alert('Failed to load sections')
      })
  }

  function renderSections(sections) {
    render(html`
      ${sections.map(s => html`
        <div class="canvas-section" data-id="${s.id}">
          <div contenteditable="true" class="section-editor" data-id="${s.id}">${s.text}</div>
        </div>
      `)}
    `, editorContainer)
  }

  function loadHistory() {
    api.get(`/ideas/${ideaId}/history`)
      .then(renderHistory)
      .catch(err => {
        console.error('Error loading history', err)
        alert('Failed to load history')
      })
  }

  function renderHistory(entries) {
    render(html`
      <div class="history-list">
        ${entries.map(e => html`
          <div class="history-item" data-id="${e.id}">
            <span class="history-meta">${new Date(e.timestamp).toLocaleString()} by ${e.author}</span>
            <button data-action="view" data-id="${e.id}">View</button>
            <button data-action="revert" data-id="${e.id}">Revert</button>
          </div>
        `)}
      </div>
    `, historyContainer)
  }

  function updateSectionText(el, newText) {
    const isFocused = document.activeElement === el
    let start = 0, end = 0, selection
    if (isFocused) {
      selection = window.getSelection()
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0)
        const pre = document.createRange()
        pre.selectNodeContents(el)
        pre.setEnd(range.startContainer, range.startOffset)
        start = pre.toString().length
        end = start + range.toString().length
      }
    }
    el.innerText = newText
    if (isFocused && selection) {
      const textNode = el.firstChild || el
      const newRange = document.createRange()
      const len = textNode.textContent.length
      newRange.setStart(textNode, Math.min(start, len))
      newRange.setEnd(textNode, Math.min(end, len))
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }

  function onRemoteChange({ sectionId, newText }) {
    const el = editorContainer.querySelector(`.section-editor[data-id="${sectionId}"]`)
    if (el && el.innerText !== newText) {
      updateSectionText(el, newText)
    }
  }

  function onHistoryUpdate() {
    loadHistory()
  }

  socket.subscribe(`canvas:${ideaId}`, onRemoteChange)
  socket.subscribe(`canvas:${ideaId}:history`, onHistoryUpdate)

  const autoSave = throttle((sectionId, text) => {
    api.post(`/ideas/${ideaId}/sections/${sectionId}/history`, { text })
      .then(entry => {
        socket.broadcast({ channel: `canvas:${ideaId}:history`, entry })
      })
      .catch(err => {
        console.error('Auto-save history failed', err)
      })
  }, 5000)

  function onSectionEdit(sectionId, newText) {
    api.put(`/ideas/${ideaId}/sections/${sectionId}`, { text: newText })
      .catch(err => {
        console.error('Failed to save section', err)
        alert('Failed to save changes')
      })
    socket.broadcast({ channel: `canvas:${ideaId}`, sectionId, newText })
    autoSave(sectionId, newText)
  }

  function viewHistory(id) {
    api.get(`/ideas/${ideaId}/history/${id}`)
      .then(data => {
        alert(data.text)
      })
      .catch(err => {
        console.error('Failed to load history entry', err)
        alert('Failed to load entry')
      })
  }

  function revertHistory(id) {
    if (!confirm('Revert to this version?')) return
    api.post(`/ideas/${ideaId}/history/${id}/revert`)
      .then(() => {
        loadSections()
      })
      .catch(err => {
        console.error('Failed to revert', err)
        alert('Revert failed')
      })
  }

  function handleInput(e) {
    if (!e.target.matches('.section-editor')) return
    const sectionId = e.target.dataset.id
    const newText = e.target.innerText
    onSectionEdit(sectionId, newText)
  }

  function handleHistoryClick(e) {
    const action = e.target.dataset.action
    const id = e.target.dataset.id
    if (action === 'view') viewHistory(id)
    if (action === 'revert') revertHistory(id)
  }

  editorContainer.addEventListener('input', handleInput)
  historyContainer.addEventListener('click', handleHistoryClick)

  loadSections()
  loadHistory()

  return function teardown() {
    socket.unsubscribe(`canvas:${ideaId}`, onRemoteChange)
    socket.unsubscribe(`canvas:${ideaId}:history`, onHistoryUpdate)
    editorContainer.removeEventListener('input', handleInput)
    historyContainer.removeEventListener('click', handleHistoryClick)
  }
}