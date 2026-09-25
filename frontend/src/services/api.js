/**
 * Frontend API Service for interacting with the ARIYAAN Backend Express API.
 */

const API_BASE = '/api';

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: 'error',
      keyConfigured: false,
      message: 'Cannot reach ARIYAAN backend service. Ensure backend server is running on port 5000.'
    };
  }
}

export async function sendChatMessage({ message, history, model, temperature, apiKey }) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, history, model, temperature, apiKey })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || {
          userMessage: 'Server returned an error. Please check your backend connection.'
        }
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        userMessage: 'Unable to connect to ARIYAAN right now. Please check your internet connection and try again.'
      }
    };
  }
}

export async function testGeminiApiKey(apiKey) {
  try {
    const res = await fetch(`${API_BASE}/test-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || { userMessage: 'Invalid API key or network error.' }
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        userMessage: 'Unable to test API key. Please check your network connection.'
      }
    };
  }
}

/**
 * Execute a local OS-level voice command via the backend.
 * Only allow-listed intents (OPEN_CHROME, OPEN_CALCULATOR, etc.)
 * are accepted by the server.
 *
 * @param {string} intent - Intent constant (e.g. 'OPEN_CHROME')
 */
export async function executeVoiceCommand(intent) {
  try {
    const res = await fetch(`${API_BASE}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || { userMessage: 'Voice command failed.' } };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', userMessage: 'Cannot reach backend for voice command.' }
    };
  }
}
