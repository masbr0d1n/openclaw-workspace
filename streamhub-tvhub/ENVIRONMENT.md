# Environment Configuration Guide

This document describes how to configure environment variables for the TV Hub application across different environments.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` for your environment

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Environment Files

The application supports multiple environment configurations:

| File | Purpose | Committed to Git |
|------|---------|------------------|
| `.env.example` | Template with all required variables | ✅ Yes |
| `.env.local` | Your local configuration | ❌ No (gitignored) |
| `.env.development` | Development defaults | ✅ Yes |
| `.env.staging` | Staging server configuration | ✅ Yes |
| `.env.production` | Production server configuration | ✅ Yes |

## Environment Variables

### Backend API Configuration (Server-side)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BACKEND_API_URL` | Base URL for backend API calls from Next.js server routes | `http://localhost:8001` | `https://api.example.com` |
| `BACKEND_HOST` | Backend host (IP or hostname) used for uploads proxy | `localhost` | `192.168.1.100` |
| `BACKEND_PORT` | Backend API port | `8001` | `443` |

### Frontend Application Configuration (Client-side)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_PRODUCT` | Product identifier | `tvhub` | `tvhub` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `StreamHub TV Hub` | `My TV App` |
| `NEXT_PUBLIC_PORT` | Frontend server port for local development | `3001` | `3000` |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend URL for client-side API calls | `http://localhost:8001` | `https://api.example.com` |
| `NEXT_PUBLIC_ENV` | Current environment name | - | `development`, `staging`, `production` |

## Environment-Specific Configurations

### Development (Local)

For local development with backend running on the same machine:

```bash
BACKEND_API_URL=http://localhost:8001
BACKEND_HOST=localhost
BACKEND_PORT=8001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8001
```

### Docker (Containerized)

When running the frontend in Docker and backend on the host:

```bash
BACKEND_API_URL=http://host.docker.internal:8001
BACKEND_HOST=host.docker.internal
BACKEND_PORT=8001
NEXT_PUBLIC_BACKEND_API_URL=http://host.docker.internal:8001
```

**Note:** For Docker Desktop on Mac/Windows, `host.docker.internal` resolves to the host machine. On Linux, you may need to add `--add-host=host.docker.internal:host-gateway` to your docker run command.

### Staging

For staging environment with HTTPS:

```bash
BACKEND_API_URL=https://staging-api.yourdomain.com
BACKEND_HOST=staging-api.yourdomain.com
BACKEND_PORT=443
NEXT_PUBLIC_BACKEND_API_URL=https://staging-api.yourdomain.com
```

### Production

For production deployment:

```bash
BACKEND_API_URL=https://api.yourdomain.com
BACKEND_HOST=api.yourdomain.com
BACKEND_PORT=443
NEXT_PUBLIC_BACKEND_API_URL=https://api.yourdomain.com
```

## Next.js Rewrites

The `next.config.ts` file contains API rewrites that proxy `/api/v1/*` requests to the backend. This is configured to use the `BACKEND_API_URL` environment variable:

```typescript
async rewrites() {
  return {
    afterFiles: [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:8001'}/api/v1/:path*`,
      },
    ],
  };
}
```

This allows the frontend to make same-origin requests to `/api/v1/*` while Next.js proxies them to the backend.

## Security Notes

- **Never commit `.env.local`** - This file contains your local configuration and should be gitignored
- **Use HTTPS in production** - Always use `https://` URLs for staging and production environments
- **Rotate credentials** - If you add API keys or secrets, rotate them regularly
- **Use environment-specific backends** - Keep development, staging, and production backends separate

## Troubleshooting

### "Cannot connect to backend"

1. Verify `BACKEND_API_URL` is correct
2. Check if backend is running: `curl http://localhost:8001/api/v1/health`
3. For Docker, ensure `host.docker.internal` resolves correctly

### "CORS errors"

The application uses Next.js API routes as a proxy to avoid CORS issues. If you see CORS errors:

1. Ensure you're calling `/api/v1/*` endpoints, not direct backend URLs
2. Check that `next.config.ts` rewrites are configured correctly

### Environment variables not loading

1. Restart the development server after changing `.env.local`
2. Verify the file is in the project root
3. Check for typos in variable names
4. Ensure variables are prefixed with `NEXT_PUBLIC_` if used in client-side code

## Multi-Environment Deployment

To deploy to different environments:

1. **Development**: Use `.env.development` or `.env.local`
2. **Staging**: Copy `.env.staging` to `.env.local` and adjust as needed
3. **Production**: Set environment variables in your hosting platform (Vercel, Docker, etc.)

For CI/CD pipelines, inject environment variables through your deployment platform rather than using `.env` files.
