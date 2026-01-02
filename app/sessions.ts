const API_URL_KEY = "evo_api_url";
const API_KEY_KEY = "evo_api_key";

export function getClientSession() {
  if (typeof window === "undefined") return { apiUrl: null, apiKey: null };
  return {
    apiUrl: localStorage.getItem(API_URL_KEY),
    apiKey: localStorage.getItem(API_KEY_KEY),
  };
}

export function setClientSession(apiUrl: string, apiKey: string) {
  localStorage.setItem(API_URL_KEY, apiUrl);
  localStorage.setItem(API_KEY_KEY, apiKey);
}

export function clearClientSession() {
  localStorage.removeItem(API_URL_KEY);
  localStorage.removeItem(API_KEY_KEY);
}
