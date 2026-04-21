// MiniMap → HexMap panTo integration (task #97).
//
// HexMap is wrapped in React.forwardRef and exposes a `panTo(mapX, mapY)`
// imperative method via useImperativeHandle. Game.jsx holds a hexMapRef and
// routes MiniMap clicks via onPanTo → hexMapRef.current.panTo(mapX, mapY),
// which converts map-space coords (0..100) to SVG-space and recenters the
// zoomTransform at the current zoomLevel.
//
// Verified by `npm run typecheck` (0 errors) and `vite build` (clean bundle).
// See git history for the full integration.
