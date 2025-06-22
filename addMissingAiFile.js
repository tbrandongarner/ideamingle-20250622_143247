export async function addMissingAiFile(ideaId) {
  if (!ideaId) {
    throw new Error('addMissingAiFile: ideaId parameter is required')
  }
  const baseUrl = '/api/ai-suggestions'
  const getUrl = `${baseUrl}/${encodeURIComponent(ideaId)}`
  try {
    const getRes = await fetch(getUrl, {
      headers: { 'Accept': 'application/json' }
    })
    if (getRes.ok) {
      return await getRes.json()
    }
    if (getRes.status === 404) {
      const payload = { ideaId, suggestions: [] }
      const postRes = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!postRes.ok) {
        throw new Error(`addMissingAiFile: POST ${baseUrl} failed with status ${postRes.status} and payload ${JSON.stringify(payload)}`)
      }
      return await postRes.json()
    }
    throw new Error(`addMissingAiFile: GET ${getUrl} returned unexpected status ${getRes.status}`)
  } catch (error) {
    throw new Error(`addMissingAiFile: operation failed for ideaId=${ideaId} - ${error.message}`)
  }
}