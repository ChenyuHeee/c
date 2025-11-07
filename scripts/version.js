(function(){
  // Centralized version constants (bump when any user-visible behavior or cached asset changes)
  window.__VERSION__ = Object.freeze({
    version: 'v1.3.8',         // Unified project version (editor + contest)
    date: '2025-11-07'         // Release/update date (YYYY-MM-DD)
  });
  // Global configuration (editable): set a serverless endpoint to enable one-click submissions (no GitHub account required)
  // Example: 'https://your-worker.example.workers.dev/submit'
  window.__CONFIG__ = window.__CONFIG__ || {
    submitEndpoint: '',
    // Optional: RSA-OAEP public key (PEM, SPKI) for v4 encryption. When provided, the client will use AES-GCM + key wrapping.
    // Example:
    // submitPublicKey: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqh...\n-----END PUBLIC KEY-----\n`
    submitPublicKey: ''
  };
})();
