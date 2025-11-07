/*
 * tcc_runner.js - WASM loader for the placeholder wrapper module
 * This loader will attempt to load a built Emscripten output at one of the
 * common locations (relative to the site root). If it fails, it keeps a
 * friendly `window.wasmRun` that returns a rejected Promise with a clear
 * error message so the UI can fallback to Wandbox or simulation.
 */
/*
  DEPRECATED: Front-end WASM runner has been removed since v1.3.8.
  This file is kept as a stub to avoid 404s for old bookmarks or caches.
  No functionality is provided here anymore.
*/
(function(){
  try{ Object.defineProperty(window, 'wasmRun', { configurable:true, writable:true, value: function(){ return Promise.reject(new Error('WASM runner removed')); } }); }catch(e){}
  if (typeof console!=='undefined') console.info('[wasm] Front-end WASM runner removed in v1.3.8');
})();
