// Stand-in for Framer's library in tests. __routePath lets a test pretend Framer's router knows the page.
export const ControlType = new Proxy({}, { get: (_, k) => String(k) })
export const RenderTarget = { current: () => (globalThis.__renderTarget || 'PREVIEW'), canvas: 'CANVAS', preview: 'PREVIEW' }
export const addPropertyControls = () => {}
export const useRouter = () => (globalThis.__routePath ? { routes: { r1: { path: globalThis.__routePath } }, currentRouteId: 'r1' } : globalThis.__noRouter ? undefined : { routes: {} })
export const useCurrentRouteId = () => (globalThis.__routePath ? 'r1' : undefined)
