const apiBase = '/api/comments';
let comments = [];
let container;

async function init(selector) {
  container = document.querySelector(selector);
  if (!container) throw new Error('Comment container not found');
  container.addEventListener('click', handleContainerClick);
  await loadComments();
}

async function loadComments() {
  try {
    const canvasId = getCanvasId();
    const res = await fetch(`${apiBase}?canvasId=${encodeURIComponent(canvasId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    comments = await res.json();
    renderComments();
  } catch (e) {
    console.error('Failed to load comments', e);
  }
}

async function postComment(parentId, text) {
  try {
    const payload = { canvasId: getCanvasId(), parentId, text };
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const comment = await res.json();
    comments.push(comment);
    renderComments();
  } catch (e) {
    console.error('Failed to post comment', e);
  }
}

async function voteComment(commentId, voteType) {
  try {
    const res = await fetch(`${apiBase}/${encodeURIComponent(commentId)}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: voteType })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated = await res.json();
    const idx = comments.findIndex(c => c.id === updated.id);
    if (idx > -1) comments[idx] = updated;
    renderComments();
  } catch (e) {
    console.error('Failed to vote', e);
  }
}

function renderComments() {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const tree = buildTree(comments);
  tree.forEach(node => fragment.appendChild(renderNode(node)));
  container.appendChild(fragment);
}

function buildTree(list) {
  const map = new Map();
  const roots = [];
  list.forEach(c => {
    map.set(c.id, { ...c, children: [] });
  });
  map.forEach(c => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(c);
      else roots.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

function renderNode(node) {
  const el = document.createElement('div');
  el.className = 'comment';
  el.dataset.id = node.id;
  el.innerHTML = `
    <div class="comment-header">
      <span class="author">${escapeHtml(node.author)}</span>
      <span class="score">Score: <span class="score-value">${node.score}</span></span>
    </div>
    <div class="comment-body">${escapeHtml(node.text)}</div>
    <div class="comment-actions">
      <button class="vote-btn" data-vote="up">Upvote</button>
      <button class="vote-btn" data-vote="down">Downvote</button>
      <button class="reply-btn">Reply</button>
    </div>
  `;
  if (node.children.length) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'comment-children';
    node.children.forEach(child => {
      childrenContainer.appendChild(renderNode(child));
    });
    el.appendChild(childrenContainer);
  }
  return el;
}

function handleContainerClick(event) {
  const voteBtn = event.target.closest('.vote-btn');
  if (voteBtn) {
    const commentEl = voteBtn.closest('.comment');
    if (!commentEl) return;
    voteComment(commentEl.dataset.id, voteBtn.dataset.vote);
    return;
  }
  const replyBtn = event.target.closest('.reply-btn');
  if (replyBtn) {
    const commentEl = replyBtn.closest('.comment');
    if (!commentEl || commentEl.querySelector('.reply-form')) return;
    const form = document.createElement('div');
    form.className = 'reply-form';
    form.innerHTML = `
      <textarea class="reply-text" rows="2"></textarea>
      <button class="submit-reply">Submit</button>
    `;
    commentEl.appendChild(form);
    return;
  }
  const submitBtn = event.target.closest('.submit-reply');
  if (submitBtn) {
    const form = submitBtn.closest('.reply-form');
    const commentEl = submitBtn.closest('.comment');
    if (!form || !commentEl) return;
    const textEl = form.querySelector('.reply-text');
    const text = textEl.value.trim();
    if (text) {
      postComment(commentEl.dataset.id, text);
    }
    return;
  }
}

function getCanvasId() {
  return document.body.dataset.canvasId || '';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
}

const CanvasCommentVotingManager = {
  init,
  loadComments,
  postComment,
  voteComment
};

export default CanvasCommentVotingManager;