function getEnv(key, required = false, defaultValue, envObj = process.env) {
  const value = envObj[key] ?? defaultValue
  if (required && (value === undefined || value === '')) {
    throw new Error(`Environment variable "${key}" is required but was not provided.`)
  }
  return value
}

export function loadConfig(envObj = process.env) {
  const config = {
    API_BASE_URL: getEnv('API_BASE_URL', false, 'https://api.ideamingle.com', envObj),
    AUTH_DOMAIN: getEnv('AUTH_DOMAIN', true, undefined, envObj),
    TRELLO_KEY: getEnv('TRELLO_KEY', true, undefined, envObj),
    STRIPE_PK: getEnv('STRIPE_PK', true, undefined, envObj),
    authTokenKey: getEnv('AUTH_TOKEN_KEY', false, 'authToken', envObj)
  }
  return Object.freeze(config)
}