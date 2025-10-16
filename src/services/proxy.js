// src/services/proxy.js
const PROXY_URL = 'https://cors-anywhere.herokuapp.com'; // Free CORS proxy
// Alternatively, set up your own proxy server

export const createProxyUrl = (originalUrl) => {
  return `${PROXY_URL}/${originalUrl}`;
};