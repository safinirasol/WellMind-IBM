// Optional Watson helper
export async function triggerWatson(payload: any) {
  const url = process.env.WATSON_URL
  const key = process.env.WATSON_API_KEY
  if (!url || !key) throw new Error('Watson/AICare not configured')
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }, body: JSON.stringify(payload) })
  return res.json()
}
// Helper for calling IBM watsonx / AICare endpoints.
// Looks for AICARE_* env vars first, then falls back to WATSONX_* and WATSON_* for compatibility.
// Helper for calling IBM watsonx / AICare endpoints.
// Looks for AICARE_* env vars first, then falls back to WATSONX_* and WATSON_* for compatibility.
export async function triggerWatson(payload: any) {
  const url = process.env.AICARE_URL || process.env.WATSONX_URL || process.env.WATSON_URL
  const key = process.env.AICARE_API_KEY || process.env.WATSONX_API_KEY || process.env.WATSON_API_KEY
  if (!url || !key) throw new Error('Watson/AICare not configured')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}
