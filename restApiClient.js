import { loadConfig } from './envConfigLoader.js'

const Config = loadConfig()

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getToken() {
  return localStorage.getItem(Config.authTokenKey)
}

async function request(method, path, body) {
  const baseUrl = Config.API_BASE_URL.replace(/\/+$/, '') + '/'
  let url
  try {
    url = new URL(path, baseUrl)
  } catch (err) {
    throw new ApiError(`Invalid URL path: ${path}`, 0, err)
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body != null && method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url.toString(), options)
  } catch (err) {
    throw new ApiError(`Network error: ${err.message}`, 0, null)
  }

  const contentType = response.headers.get('Content-Type') || ''
  const isJson = contentType.includes('application/json')

  let data
  try {
    data = isJson ? await response.json() : await response.text()
  } catch (err) {
    throw new ApiError(`Error parsing response: ${err.message}`, response.status, null)
  }

  if (!response.ok) {
    const message = isJson && data && data.message ? data.message : data
    throw new ApiError(message, response.status, data)
  }

  return data
}

export { ApiError }

export default {
  get:    path        => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  del:    path        => request('DELETE', path)
}