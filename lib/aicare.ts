// Fallback AI responses for demo/hackathon when Watson API is unavailable
const fallbackResponses: Record<string, string> = {
  stress: "I hear you 💙 Stress is tough, but you can manage it.\n\nQuick Relief (Try Now):\n\n• 🫁 Take 3 deep breaths\n• 💧 Drink some water\n• 🚶 Walk for 5 minutes\n\nThis Week:\n\n• ✅ Take breaks every 90 min\n• 🛑 Say no to 1 non-essential task\n• 💬 Talk to someone you trust\n• 🏃 Move your body daily\n\nYou've got this! Pick one thing above and try it today.\n\nWhat feels most doable for you?",
  
  overwhelmed: "I get it 🤗 Let's make this manageable.\n\nRight Now:\n\n• Pause. Take 3 deep breaths\n• Write down everything on your mind\n• Pick the ONE most urgent thing\n\nThis Week:\n\n• 📋 Focus on priorities, not everything\n• 🗣️ Delegate what you can\n• ⏰ Block focus time in your calendar\n• 🙅 Practice saying 'not now'\n\nRemember: You don't have to do it all at once.\n\nWhat's the most pressing thing right now?",
  
  burnout: "I'm worried about you 💔 Burnout is serious.\n\nWarning Signs:\n\n• 😴 Always exhausted\n• 😔 Don't care anymore\n• 📉 Work quality dropping\n• 🚫 Emotionally numb\n\nWhat You Can Do:\n\n• ✅ Acknowledge it (you just did!)\n• 💬 Talk to your manager or HR\n• 🏖️ Take time off ASAP\n• ⚖️ Reassess your workload\n• 🩺 Consider professional help\n\nThis is urgent. Don't ignore it.\n\nNeed help talking to your manager?",
  
  workload: "Let's tackle this together 💪\n\nQuick Questions:\n\n• ⏱️ Hours working per week?\n• 📅 Are deadlines realistic?\n• 👥 Can others help?\n\nTry These:\n\n• 📊 Track your time for 3 days\n• 📦 Batch similar tasks\n• ⚡ 2-min rule: Do it or schedule it\n• 🗣️ Communicate realistic timelines\n• 🤖 Automate repetitive stuff\n\nYou deserve balance.\n\nWhat's the biggest challenge?",
  
  default: "Hi there! 👋 I'm here to support your wellness.\n\nI Can Help With:\n\n• 😰 Stress management\n• 📋 Workload planning\n• 🔥 Burnout prevention\n• ⚖️ Work-life balance\n• 💚 Mental health support\n\nJust talk to me. What's on your mind today?"
};

function getSmartFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('stress') || lowerMsg.includes('stressful') || lowerMsg.includes('anxious')) {
    return fallbackResponses.stress;
  }
  if (lowerMsg.includes('overwhelm') || lowerMsg.includes('too much') || lowerMsg.includes('can\'t handle')) {
    return fallbackResponses.overwhelmed;
  }
  if (lowerMsg.includes('burnout') || lowerMsg.includes('burned out') || lowerMsg.includes('exhausted')) {
    return fallbackResponses.burnout;
  }
  if (lowerMsg.includes('workload') || lowerMsg.includes('too many tasks') || lowerMsg.includes('deadline')) {
    return fallbackResponses.workload;
  }
  
  return fallbackResponses.default;
}

// Token cache to avoid fetching on every request
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getIAMToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.IBM_CLOUD_API_KEY || process.env.AICARE_API_KEY;
  
  if (!apiKey) {
    throw new Error("IBM_CLOUD_API_KEY or AICARE_API_KEY not set");
  }

  // If the key looks like it's already a JWT token, use it directly
  if (apiKey.includes('.') && apiKey.split('.').length === 3) {
    console.log("🔑 Using provided token directly");
    return apiKey;
  }

  // Otherwise, exchange API key for IAM token
  console.log("🔄 Exchanging API key for IAM token...");
  
  const form = new URLSearchParams();
  form.set('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
  form.set('apikey', apiKey);

  const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`IAM token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + ((data.expires_in - 300) * 1000); // Refresh 5 min early
  
  console.log("✅ IAM token obtained");
  return cachedToken!;
}

export async function triggerAICare(payload: any) {
  const url = process.env.AICARE_URL;
  const useFallback = process.env.USE_FALLBACK_AI === 'true';

  console.log("🚀 Calling AICare:", url?.slice(0, 50) + "...");

  // Use fallback AI if enabled or if Watson API fails
  if (useFallback || !url) {
    console.log("💡 Using fallback AI responses (hackathon demo mode)");
    const userMessage = payload.input?.text || payload.message || '';
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return {
      reply: getSmartFallbackResponse(userMessage),
      fallback: true
    };
  }

  try {
    const token = await getIAMToken();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ AICare API failed (${res.status}):`, err.substring(0, 200));
      
      // Fall back to demo AI on authentication errors
      if (res.status === 401 || res.status === 403) {
        console.log("💡 Falling back to demo AI due to auth error");
        const userMessage = payload.input?.text || payload.message || '';
        return {
          reply: getSmartFallbackResponse(userMessage),
          fallback: true
        };
      }
      
      throw new Error(`AICare request failed (${res.status}): ${err}`);
    }

    const response = await res.json();
    console.log("✅ AICare response received");
    
    // Watson Orchestrate may return response in different formats
    return response;
  } catch (error) {
    console.error("❌ AICare connection error:", error instanceof Error ? error.message : error);
    
    // Fallback to demo AI on any error
    console.log("💡 Using fallback AI due to connection error");
    const userMessage = payload.input?.text || payload.message || '';
    return {
      reply: getSmartFallbackResponse(userMessage),
      fallback: true
    };
  }
}
