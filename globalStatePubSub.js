const state = {};
const subscribers = new Map();
const updateQueue = [];
let isNotifying = false;

/**
 * Returns a shallow copy of the current state.
 * Note: Nested mutations inside state objects will go unnoticed. Treat state as immutable.
 */
function getState() {
  return { ...state };
}

/**
 * Updates the global state with the provided updates.
 * Nested setState calls are queued to prevent reentrancy loops.
 * @param {Object} updates - key/value pairs to merge into state
 * @throws {TypeError} if updates is not a non-null object
 */
function setState(updates) {
  if (typeof updates !== 'object' || updates === null) {
    throw new TypeError('setState expects an object of updates');
  }

  if (isNotifying) {
    updateQueue.push(updates);
    return;
  }

  isNotifying = true;
  try {
    applyStateUpdates(updates);
  } finally {
    isNotifying = false;
  }

  while (updateQueue.length > 0) {
    const next = updateQueue.shift();
    setState(next);
  }
}

function applyStateUpdates(updates) {
  const prevState = { ...state };
  const changedKeys = [];

  for (const [key, value] of Object.entries(updates)) {
    if (!Object.is(state[key], value)) {
      state[key] = value;
      changedKeys.push(key);
    }
  }
  if (changedKeys.length === 0) return;

  for (const key of changedKeys) {
    const handlers = subscribers.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(state[key], key, getState());
        } catch (err) {
          console.error(`Error in subscriber for key "${key}":`, err);
        }
      }
    }
  }

  const globalHandlers = subscribers.get('*');
  if (globalHandlers) {
    for (const handler of globalHandlers) {
      try {
        handler(getState(), changedKeys, prevState);
      } catch (err) {
        console.error('Error in global subscriber:', err);
      }
    }
  }
}

/**
 * Subscribes to changes in state.
 * @param {string|function} keyOrHandler - The state key to watch or a handler for all changes
 * @param {function} [handler] - The callback when a key is specified
 * @returns {function} unsubscribe function
 * @throws {TypeError} if arguments are invalid
 */
function subscribeState(keyOrHandler, handler) {
  let key;
  let cb;

  if (typeof keyOrHandler === 'string') {
    key = keyOrHandler;
    cb = handler;
    if (typeof cb !== 'function') {
      throw new TypeError('Subscriber callback must be a function');
    }
  } else if (typeof keyOrHandler === 'function') {
    key = '*';
    cb = keyOrHandler;
  } else {
    throw new TypeError('subscribe requires a key string and handler or a single handler function');
  }

  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key).add(cb);

  return function unsubscribe() {
    const set = subscribers.get(key);
    if (set) {
      set.delete(cb);
      if (set.size === 0) {
        subscribers.delete(key);
      }
    }
  };
}

export { getState, setState, subscribeState };