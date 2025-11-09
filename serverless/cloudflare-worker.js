// Deprecated: serverless one-click submission was removed in v1.3.19.
// This file is kept only to avoid broken links in historical docs.
// It returns HTTP 410 Gone for any request.

export default {
  async fetch(request) {
    const body = JSON.stringify({ ok: false, error: 'Serverless submission is deprecated since v1.3.19. Use PR-based submission.' });
    return new Response(body, {
      status: 410,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type'
      }
    });
  }
};
