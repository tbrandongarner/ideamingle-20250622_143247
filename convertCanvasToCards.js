export default function convertCanvasToCards(canvasData, container) {
  const containerEl = typeof container === 'string'
    ? document.querySelector(container)
    : container instanceof HTMLElement
      ? container
      : null;
  if (!containerEl) {
    throw new Error('Container element not found');
  }
  containerEl.innerHTML = '';
  if (canvasData == null) {
    console.warn('convertCanvasToCards: canvasData is null or undefined');
    return;
  }
  if (!Array.isArray(canvasData)) {
    throw new Error('canvasData should be an array');
  }
  const fragment = document.createDocumentFragment();
  canvasData.forEach(item => {
    const {
      id = '',
      title = '',
      description = '',
      author = '',
      votes = 0,
      comments = []
    } = item;
    if (!Array.isArray(comments)) {
      throw new Error(`comments should be an array for item id: ${id}`);
    }
    const commentsCount = comments.length;
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    const header = document.createElement('div');
    header.className = 'card-header';
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    header.appendChild(titleEl);
    const body = document.createElement('div');
    body.className = 'card-body';
    const descEl = document.createElement('p');
    descEl.textContent = description;
    body.appendChild(descEl);
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const authorEl = document.createElement('span');
    authorEl.className = 'card-author';
    authorEl.textContent = author ? `By ${author}` : '';
    const votesEl = document.createElement('span');
    votesEl.className = 'card-votes';
    votesEl.textContent = `? ${votes}`;
    const commentsEl = document.createElement('span');
    commentsEl.className = 'card-comments';
    commentsEl.textContent = `? ${commentsCount}`;
    footer.appendChild(authorEl);
    footer.appendChild(votesEl);
    footer.appendChild(commentsEl);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    fragment.appendChild(card);
  });
  containerEl.appendChild(fragment);
}