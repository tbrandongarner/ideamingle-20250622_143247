export default async function addMissingSheetEntry(
  itemIds,
  existingEntries,
  { endpoint = '/api/sheet/entries', fetchImplementation = fetch, maxConcurrency = 5 } = {}
) {
  if (!Array.isArray(itemIds) || !Array.isArray(existingEntries)) {
    throw new TypeError('itemIds and existingEntries must be arrays');
  }
  if (typeof endpoint !== 'string') {
    throw new TypeError('options.endpoint must be a string');
  }
  if (typeof fetchImplementation !== 'function') {
    throw new TypeError('options.fetchImplementation must be a function');
  }
  if (!Number.isInteger(maxConcurrency) || maxConcurrency <= 0) {
    throw new TypeError('options.maxConcurrency must be a positive integer');
  }

  const existingIds = new Set(existingEntries.map(entry => entry.id));
  const missingIds = itemIds.filter(id => !existingIds.has(id));

  if (missingIds.length === 0) {
    return { successes: [], errors: [] };
  }

  const createEntry = async id => {
    const response = await fetchImplementation(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to add entry for id "${id}": ${errorText}`);
    }

    return response.json();
  };

  const results = [];
  for (let i = 0; i < missingIds.length; i += maxConcurrency) {
    const batch = missingIds.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(id =>
      createEntry(id)
        .then(entry => ({ id, success: true, entry }))
        .catch(error => {
          console.error(error);
          return { id, success: false, error: error.message || String(error) };
        })
    );
    // eslint-disable-next-line no-await-in-loop
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  const successes = results.filter(r => r.success).map(r => r.entry);
  const errors = results.filter(r => !r.success).map(r => ({ id: r.id, error: r.error }));

  return { successes, errors };
}