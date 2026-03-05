(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__092f8c1f._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/.openclaw/workspace/streamhub-tvhub/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
/**
 * Middleware - DISABLED
 *
 * We handle authentication on the client side using:
 * - Zustand store with localStorage persistence
 * - Dashboard layout auth check
 * - AuthChecker component
 *
 * Server-side middleware is not needed and causes issues because:
 * - It can't access localStorage (only cookies)
 * - We store tokens in localStorage, not cookies
 * - Client-side auth is sufficient for our use case
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$tvhub$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.openclaw/workspace/streamhub-tvhub/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$tvhub$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.openclaw/workspace/streamhub-tvhub/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    // Middleware is disabled - all auth is handled client-side
    // Just let all requests pass through
    return __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$tvhub$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Match all request paths
     * Auth is handled client-side in dashboard layout
     */ '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__092f8c1f._.js.map