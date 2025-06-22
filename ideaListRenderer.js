class IdeaListRenderer {
  constructor(container, { onVote, onComment, onIdeaClick }) {
    this.container = container;
    this.onVote = onVote;
    this.onComment = onComment;
    this.onIdeaClick = onIdeaClick;
  }

  render(ideas) {
    this.container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const list = document.createElement('ul');
    list.className = 'idea-list';

    ideas.forEach(idea => {
      const item = document.createElement('li');
      item.className = 'idea-card';
      item.setAttribute('data-id', idea.id);

      // Header
      const header = document.createElement('div');
      header.className = 'idea-header';

      const title = document.createElement('h3');
      title.className = 'idea-title';
      title.textContent = idea.title || 'Untitled Idea';
      header.appendChild(title);

      const author = document.createElement('span');
      author.className = 'idea-author';
      author.textContent = idea.author || 'Anonymous';
      header.appendChild(author);

      item.appendChild(header);

      // Description
      if (idea.description) {
        const desc = document.createElement('p');
        desc.className = 'idea-description';
        desc.textContent = idea.description;
        item.appendChild(desc);
      }

      // Footer
      const footer = document.createElement('div');
      footer.className = 'idea-footer';

      const votes = document.createElement('button');
      votes.type = 'button';
      votes.className = 'idea-vote-button';
      votes.textContent = `? ${idea.votes || 0}`;
      votes.setAttribute('aria-label', `Upvote idea ${idea.id}`);
      votes.addEventListener('click', e => {
        e.stopPropagation();
        this.onVote(idea.id);
      });
      footer.appendChild(votes);

      const comments = document.createElement('button');
      comments.type = 'button';
      comments.className = 'idea-comment-button';
      comments.textContent = `? ${idea.comments || 0}`;
      comments.setAttribute('aria-label', `View comments for idea ${idea.id}`);
      comments.addEventListener('click', e => {
        e.stopPropagation();
        this.onComment(idea.id);
      });
      footer.appendChild(comments);

      const timestamp = document.createElement('span');
      timestamp.className = 'idea-timestamp';
      timestamp.textContent = this._formatTime(idea.timestamp);
      footer.appendChild(timestamp);

      item.appendChild(footer);

      // Click on card
      item.addEventListener('click', () => {
        this.onIdeaClick(idea.id);
      });

      list.appendChild(item);
    });

    fragment.appendChild(list);
    this.container.appendChild(fragment);
  }

  _formatTime(ts) {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}

export default IdeaListRenderer;