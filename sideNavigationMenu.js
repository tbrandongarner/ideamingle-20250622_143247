class SideNavigationMenu {
  constructor({ containerSelector, items = [], breakpoint = 768, toggleButtonSelector = '' }) {
    this.containerSelector = containerSelector;
    this.items = items;
    this.breakpoint = breakpoint;
    this.toggleButtonSelector = toggleButtonSelector;
    this.activePath = window.location.pathname + window.location.search + window.location.hash;
    this._init();
  }

  _init() {
    const container = document.querySelector(this.containerSelector);
    if (!container) {
      throw new Error(`Container not found: ${this.containerSelector}`);
    }
    this.container = container;

    const nav = document.createElement('nav');
    nav.className = 'side-nav';

    const ul = document.createElement('ul');
    ul.className = 'side-nav-list';
    this.items.forEach(item => {
      ul.appendChild(this.createItem(item));
    });
    nav.appendChild(ul);
    container.appendChild(nav);

    if (this.toggleButtonSelector) {
      const btn = document.querySelector(this.toggleButtonSelector);
      if (!btn) {
        throw new Error(`Toggle button not found: ${this.toggleButtonSelector}`);
      }
      this.toggleButton = btn;
    } else {
      const btn = document.createElement('button');
      btn.className = 'side-nav-toggle';
      btn.setAttribute('aria-label', 'Toggle navigation');
      btn.textContent = '\u2630';
      container.appendChild(btn);
      this.toggleButton = btn;
    }

    this.navElement = nav;
    this.cacheElements();
    this.attachEvents();
    this.handleResize();
    this.updateActiveLink();
  }

  createItem(item) {
    const li = document.createElement('li');
    li.className = 'side-nav-item';

    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    a.className = 'side-nav-link';

    if (item.iconClass) {
      const icon = document.createElement('i');
      icon.className = item.iconClass;
      a.prepend(icon);
    }

    li.appendChild(a);

    if (Array.isArray(item.children) && item.children.length > 0) {
      a.setAttribute('aria-expanded', 'false');
      const subUl = document.createElement('ul');
      subUl.className = 'side-nav-sublist';
      item.children.forEach(child => {
        subUl.appendChild(this.createItem(child));
      });
      li.appendChild(subUl);
      li.classList.add('has-children');
      a.addEventListener('click', e => {
        e.preventDefault();
        const expanded = li.classList.toggle('expanded');
        a.setAttribute('aria-expanded', expanded.toString());
      });
    }

    return li;
  }

  cacheElements() {
    this.navLinks = Array.from(this.navElement.querySelectorAll('.side-nav-link'));
  }

  attachEvents() {
    this.toggleButton.addEventListener('click', () => this.toggle());
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('popstate', () => {
      this.activePath = window.location.pathname + window.location.search + window.location.hash;
      this.updateActiveLink();
    });
    this.navLinks.forEach(link => {
      link.addEventListener('click', e => this.onLinkClick(e));
    });
    document.addEventListener('click', e => {
      if (
        !this.navElement.contains(e.target) &&
        !this.toggleButton.contains(e.target)
      ) {
        this.close();
      }
    });
  }

  onLinkClick(e) {
    this.activePath = e.currentTarget.getAttribute('href');
    this.updateActiveLink();
    if (window.innerWidth < this.breakpoint) {
      this.close();
    }
  }

  updateActiveLink() {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === this.activePath) {
        link.classList.add('active');
        let parent = link.parentElement;
        while (parent && parent !== this.navElement) {
          if (parent.classList.contains('side-nav-item')) {
            parent.classList.add('expanded');
            const parentLink = parent.querySelector('a.side-nav-link');
            if (parentLink) {
              parentLink.setAttribute('aria-expanded', 'true');
            }
          }
          parent = parent.parentElement;
        }
      } else {
        link.classList.remove('active');
      }
    });
  }

  open() {
    this.navElement.classList.add('open');
    document.body.classList.add('side-nav-open');
  }

  close() {
    this.navElement.classList.remove('open');
    document.body.classList.remove('side-nav-open');
  }

  toggle() {
    if (this.navElement.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  handleResize() {
    if (window.innerWidth >= this.breakpoint) {
      this.open();
    } else {
      this.close();
    }
  }
}

export default SideNavigationMenu;