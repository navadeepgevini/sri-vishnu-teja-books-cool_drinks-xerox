// Bridge between the DOM side (viewers) and the shared canvas, which renders on demand.
// No three.js imports here, so viewers can call it without loading the 3D chunk.

let request: () => void = () => {}

/** Ask the shared canvas for one more frame. A no-op until the canvas has mounted. */
export function requestRender() {
  request()
}

/** Called by SharedCanvas with react-three-fiber's invalidate(). Returns an unregister function. */
export function registerRenderer(fn: () => void): () => void {
  request = fn
  return () => {
    if (request === fn) request = () => {}
  }
}
