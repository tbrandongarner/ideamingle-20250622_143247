class TopBarUserActions {
  constructor({ container, callbacks = {} }) {
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }
    this.callbacks = callbacks;
    this.user = null;
    this.notifications = 0;
    this.wrapper = null;
    this._onDocumentClick = this._onDocumentClick.bind(this);
    document.addEventListener('click', this._onDocumentClick);
    this._init();
  }

  _init() {
    if (!this.container) return;
    if (this.wrapper) {
      this.container.removeChild(this.wrapper);
      this.wrapper = null;
    }
    if (this.user && this.user.id) {
      this._renderLoggedIn();
    } else {
      this._renderLoggedOut();
    }
  }

  _renderLoggedOut() {
    const wrapper = document.createElement('div');
    wrapper.className = 'topbar-actions topbar-actions--guest';

    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn topbar-btn topbar-btn--login';
    loginBtn.textContent = 'Login';
    loginBtn.type = 'button';
    loginBtn.addEventListener('click', e => this.callbacks.onLogin && this.callbacks.onLogin(e));

    const signUpBtn = document.createElement('button');
    signUpBtn.className = 'btn topbar-btn topbar-btn--signup';
    signUpBtn.textContent = 'Sign Up';
    signUpBtn.type = 'button';
    signUpBtn.addEventListener('click', e => this.callbacks.onSignUp && this.callbacks.onSignUp(e));

    wrapper.appendChild(loginBtn);
    wrapper.appendChild(signUpBtn);
    this.container.appendChild(wrapper);
    this.wrapper = wrapper;
  }

  _renderLoggedIn() {
    const wrapper = document.createElement('div');
    wrapper.className = 'topbar-actions topbar-actions--user';

    const userBtn = document.createElement('button');
    userBtn.className = 'topbar-btn topbar-btn--user';
    userBtn.type = 'button';
    userBtn.setAttribute('aria-haspopup', 'true');
    userBtn.setAttribute('aria-expanded', 'false');
    userBtn.addEventListener('click', e => this._toggleMenu(e));
    userBtn.addEventListener('keydown', e => this._onUserBtnKeyDown(e));

    const avatar = document.createElement('img');
    avatar.className = 'topbar-avatar';
    avatar.src = this.user.avatarUrl || '';
    avatar.alt = this.user.name || 'User';
    userBtn.appendChild(avatar);
    wrapper.appendChild(userBtn);

    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu topbar-menu';
    menu.setAttribute('aria-label', 'User menu');
    menu.hidden = true;
    menu.addEventListener('keydown', e => this._onMenuKeyDown(e));

    const profileItem = this._createMenuItem('Profile', 'profile');
    const settingsItem = this._createMenuItem('Settings', 'settings');
    const notiItem = this._createMenuItem(`Notifications (${this.notifications})`, 'notifications');
    const logoutItem = this._createMenuItem('Logout', 'logout');

    menu.append(profileItem, settingsItem, notiItem, logoutItem);
    wrapper.appendChild(menu);

    this.container.appendChild(wrapper);
    this.wrapper = wrapper;
  }

  _createMenuItem(text, action) {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dropdown-btn';
    btn.textContent = text;
    btn.addEventListener('click', e => this._handleAction(action, e));
    li.appendChild(btn);
    return li;
  }

  _handleAction(action, e) {
    switch (action) {
      case 'profile':
        this.callbacks.onProfile && this.callbacks.onProfile(e);
        break;
      case 'settings':
        this.callbacks.onSettings && this.callbacks.onSettings(e);
        break;
      case 'notifications':
        this.callbacks.onNotifications && this.callbacks.onNotifications(e);
        break;
      case 'logout':
        this.callbacks.onLogout && this.callbacks.onLogout(e);
        break;
    }
    this._closeMenu();
  }

  _toggleMenu(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const menu = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.hidden = expanded;
    if (!expanded) {
      setTimeout(() => {
        const first = menu.querySelector('.dropdown-btn');
        first && first.focus();
      }, 0);
    }
  }

  _closeMenu() {
    if (!this.wrapper) return;
    const btn = this.wrapper.querySelector('.topbar-btn--user');
    const menu = this.wrapper.querySelector('.topbar-menu');
    if (btn && menu && !menu.hidden) {
      btn.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  }

  _onDocumentClick(e) {
    if (this.wrapper && !this.wrapper.contains(e.target)) {
      this._closeMenu();
    }
  }

  _onUserBtnKeyDown(e) {
    const { key } = e;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      this._toggleMenu(e);
    } else if (key === 'Escape') {
      this._closeMenu();
      e.currentTarget.focus();
    }
  }

  _onMenuKeyDown(e) {
    const menu = e.currentTarget;
    const items = Array.from(menu.querySelectorAll('.dropdown-btn'));
    const idx = items.indexOf(document.activeElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._focusMenuItem(items, idx, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusMenuItem(items, idx, -1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        document.activeElement.click();
        break;
      case 'Escape':
        e.preventDefault();
        this._closeMenu();
        const userBtn = this.wrapper.querySelector('.topbar-btn--user');
        userBtn && userBtn.focus();
        break;
    }
  }

  _focusMenuItem(items, currentIndex, direction) {
    const len = items.length;
    let next = 0;
    if (currentIndex >= 0) {
      next = (currentIndex + direction + len) % len;
    }
    items[next].focus();
  }

  updateUser(user) {
    this.user = user;
    this._init();
  }

  updateNotifications(count) {
    this.notifications = count;
    if (this.user && this.user.id) {
      this._init();
    }
  }
}

export default TopBarUserActions;