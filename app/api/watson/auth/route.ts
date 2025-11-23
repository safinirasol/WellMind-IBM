import { NextResponse } from 'next/server'

/**
 * Watson Orchestrate Auth Token Endpoint
 * Exchanges an IBM Cloud API key for an IAM access token.
 * The embedded widget expects a Bearer token provided via event.authToken.
 */
export async function POST() {
  try {
    // Prefer dedicated IBM Cloud API key if provided, else fall back
    const ibmApiKey = process.env.IBM_CLOUD_API_KEY || process.env.AICARE_API_KEY;

    if (!ibmApiKey) {
      return NextResponse.json(
        { error: 'IBM API key not configured. Set `IBM_CLOUD_API_KEY` or `AICARE_API_KEY`.' },
        { status: 500 }
      );
    }

    const form = new URLSearchParams();
    form.set('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    form.set('apikey', ibmApiKey);

    const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: form.toString(),
      // prevent Next from caching tokens
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('IAM token exchange failed:', res.status, text);
      return NextResponse.json(
        { error: 'Failed to obtain IAM token', status: res.status },
        { status: 500 }
      );
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    if (!data?.access_token) {
      console.error('IAM token response missing access_token');
      return NextResponse.json({ error: 'Invalid IAM token response' }, { status: 500 });
    }

    return NextResponse.json({ token: data.access_token, expiresIn: data.expires_in });
  } catch (error) {
    console.error('Auth token error:', error);
    return NextResponse.json({ error: 'Failed to generate auth token' }, { status: 500 });
  }
}
