import api from './restApiClient.js';
import { loadConfig } from './envConfigLoader.js';

const Config = loadConfig();

const subscribers = [];
let currentUser = null;
let initCompleted = false;

function setAuthHeader(token) {
  if (api.defaults && api.defaults.headers && api.defaults.headers.common) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else if (typeof api.setAuthToken === 'function') {
    api.setAuthToken(token);
  }
}

function clearAuthHeader() {
  if (api.defaults && api.defaults.headers && api.defaults.headers.common) {
    delete api.defaults.headers.common['Authorization'];
  } else if (typeof api.clearAuthToken === 'function') {
    api.clearAuthToken();
  }
}

function storeToken(token) {
  try {
    localStorage.setItem(Config.authTokenKey, token);
  } catch (err) {
    console.error('Error storing auth token:', err);
  }
  setAuthHeader(token);
}

function removeToken() {
  try {
    localStorage.removeItem(Config.authTokenKey);
  } catch (err) {
    console.error('Error removing auth token:', err);
  }
  clearAuthHeader();
}

function notifyAuthState(user) {
  currentUser = user;
  subscribers.forEach(cb => {
    try {
      cb(user);
    } catch (err) {
      console.error('Error in auth subscriber callback:', err);
    }
  });
}

async function initAuthState() {
  let token = null;
  try {
    token = localStorage.getItem(Config.authTokenKey);
  } catch (err) {
    console.error('Error reading auth token from storage:', err);
  }
  if (token) {
    setAuthHeader(token);
    try {
      const resp = await api.get('/auth/me');
      notifyAuthState(resp.user);
    } catch (err) {
      console.error('Error validating auth token:', err);
      removeToken();
      notifyAuthState(null);
    }
  } else {
    notifyAuthState(null);
  }
  initCompleted = true;
}

export const initAuth = initAuthState();

export async function signIn(email, pwd) {
  const resp = await api.post('/auth/login', { email, pwd });
  storeToken(resp.token);
  notifyAuthState(resp.user);
  return resp.user;
}

export async function signUp(email, pwd) {
  const resp = await api.post('/auth/signup', { email, pwd });
  storeToken(resp.token);
  notifyAuthState(resp.user);
  return resp.user;
}

export function signOut() {
  removeToken();
  notifyAuthState(null);
}

export function onAuthStateChanged(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }
  subscribers.push(callback);
  initAuth.then(() => {
    try {
      callback(currentUser);
    } catch (err) {
      console.error('Error invoking auth state callback:', err);
    }
  });
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx > -1) {
      subscribers.splice(idx, 1);
    }
  };
}