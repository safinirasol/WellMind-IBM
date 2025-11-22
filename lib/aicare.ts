export async function triggerAICare(payload: any) {
  const url = process.env.AICARE_URL;
  const key = process.env.AICARE_API_KEY;

  console.log("AICARE URL:", url);
  console.log("AICARE KEY:", key?.slice(0, 10));

  if (!url) throw new Error("AICARE_URL not set");
  if (!key) throw new Error("AICARE_API_KEY not set");

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AICare request failed (${res.status}): ${err}`);
  }

  return res.json();
}
