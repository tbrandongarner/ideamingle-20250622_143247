/**
 * Route History Manager
 * 
 * Usage:
 *   - Call init() before using any other methods.
 *   - Subscribe to route changes via subscribeHistory(fn).
 */

const historyStack = [];
let currentIndex = -1;
const listeners = new Set();
let initialized = false;

function getPath() {
  return window.location.pathname + window.location.search + window.location.hash;
}

function init(defaultPath = '/') {
  if (initialized) {
    destroy();
  }
  const initialPath = getPath() || defaultPath;
  history.replaceState({ index: 0 }, '', initialPath);
  historyStack.length = 0;
  historyStack.push(initialPath);
  currentIndex = 0;
  window.addEventListener('popstate', onPopState);
  initialized = true;
}

function destroy() {
  if (initialized) {
    window.removeEventListener('popstate', onPopState);
    initialized = false;
  }
  clear();
}

function push(path, data = {}) {
  ensureInitialized('push');
  const nextIndex = currentIndex + 1;
  history.pushState({ ...data, index: nextIndex }, '', path);
  historyStack.splice(nextIndex, historyStack.length - nextIndex, path);
  currentIndex = nextIndex;
  notify(path);
}

function replace(path, data = {}) {
  ensureInitialized('replace');
  history.replaceState({ ...data, index: currentIndex }, '', path);
  historyStack[currentIndex] = path;
  notify(path);
}

function back() {
  ensureInitialized('back');
  history.back();
}

function forward() {
  ensureInitialized('forward');
  history.forward();
}

function go(delta) {
  ensureInitialized('go');
  history.go(delta);
}

function onPopState(event) {
  const state = event.state;
  const path = getPath();
  if (state && typeof state.index === 'number') {
    currentIndex = state.index;
  } else {
    console.warn('[Router] popstate event without index; path=' + path);
    const idx = historyStack.indexOf(path);
    if (idx !== -1) {
      currentIndex = idx;
    } else {
      historyStack.push(path);
      currentIndex = historyStack.length - 1;
    }
  }
  notify(path);
}

function subscribeHistory(fn) {
  ensureInitialized('subscribeHistory');
  if (typeof fn !== 'function') {
    throw new Error('subscribeHistory expects a function');
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function clear() {
  historyStack.length = 0;
  currentIndex = -1;
}

function getHistory() {
  ensureInitialized('getHistory');
  return historyStack.slice();
}

function getCurrentIndex() {
  ensureInitialized('getCurrentIndex');
  return currentIndex;
}

function getCurrent() {
  ensureInitialized('getCurrent');
  return historyStack[currentIndex];
}

function notify(path) {
  const state = { index: currentIndex, history: getHistory() };
  listeners.forEach(fn => {
    try {
      fn(path, state);
    } catch (e) {
      console.error(e);
    }
  });
}

function ensureInitialized(method) {
  if (!initialized || currentIndex < 0) {
    throw new Error(`Router must be initialized before calling '${method}'. Call init() first.`);
  }
}

export default {
  init,
  destroy,
  push,
  replace,
  back,
  forward,
  go,
  subscribeHistory,
  clear,
  getHistory,
  getCurrent,
  getCurrentIndex
};