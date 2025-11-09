(function(){
  // Centralized version constants (bump when any user-visible behavior or cached asset changes)
    window.__VERSION__ = Object.freeze({
  version: 'v1.3.16',        // Unified project version (editor + contest)
    date: '2025-11-09'         // Release/update date (YYYY-MM-DD)
  });
  // One-click submission has been disabled (Cloudflare Worker removed / deprecated).
  // Keep a minimal config object for future extensibility.
  window.__CONFIG__ = window.__CONFIG__ || {
    submitEndpoint: '',        // Disabled: no serverless endpoint
    submitPublicKey: ''        // Disabled: forces fallback to lightweight v3 encryption
  };
})();
