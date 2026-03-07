module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/.openclaw/workspace/streamhub-videotron/src/app/api/videos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
/**
 * Next.js API Route - Proxy for Videos List
 * GET /api/videos - Get all videos from backend
 * FIXED: Remove trailing slash to prevent 308 redirect
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$videotron$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.openclaw/workspace/streamhub-videotron/node_modules/next/server.js [app-route] (ecmascript)");
;
const dynamic = 'force-dynamic';
async function GET(request) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryParams = new URLSearchParams();
        // Forward query params
        const skip = searchParams.get('skip');
        const limit = searchParams.get('limit');
        const channel_id = searchParams.get('channel_id');
        const is_active = searchParams.get('is_active');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        if (skip) queryParams.append('skip', skip);
        if (limit) queryParams.append('limit', limit);
        if (channel_id) queryParams.append('channel_id', channel_id);
        if (is_active) queryParams.append('is_active', is_active);
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        // Backend URL - NO trailing slash!
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
        const url = `${backendUrl}/videos?${queryParams.toString()}`;
        console.log('Fetching from backend:', url);
        // Fetch from backend
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json().catch(()=>({
                    message: 'Backend error'
                }));
            console.error('Backend error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$videotron$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                status: false,
                statusCode: response.status,
                message: error.message || 'Failed to fetch videos'
            }, {
                status: response.status
            });
        }
        const data = await response.json();
        console.log('Videos fetched:', data.data?.length || 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$videotron$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error('Videos API proxy error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$openclaw$2f$workspace$2f$streamhub$2d$videotron$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: false,
            statusCode: 500,
            message: 'Internal server error',
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cafb195._.js.map