# 🚀 Option B: Next.js 14 Rewrite - Master Plan

## Overview

Complete rewrite of StreamHub Dashboard using modern stack:
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State Management:** TanStack Query v5 + Zustand
- **UI Library:** Shadcn/ui (Radix UI + Tailwind)
- **Backend:** FastAPI (already running at localhost:8001)
- **Auth:** JWT with TanStack Query

---

## 📋 Project Structure

```
streamhub-nextjs/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/             # Dashboard group
│   │   ├── channels/
│   │   ├── videos/
│   │   ├── users/
│   │   └── layout.tsx
│   ├── api/                    # API routes (optional, for BFF)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home/redirect
├── components/                  # React components
│   ├── ui/                     # Shadcn UI components
│   ├── channels/               # Channel components
│   ├── videos/                 # Video components
│   └── auth/                   # Auth components
├── lib/                        # Utility libraries
│   ├── api-client.ts           # Axios with interceptors
│   ├── auth.ts                 # Auth utilities
│   └── utils.ts                # Helper functions
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts             # Auth hook
│   └── use-channels.ts         # Channels hook
├── services/                   # API service layer
│   ├── auth.service.ts         # Auth API
│   ├── channel.service.ts      # Channel API
│   └── video.service.ts        # Video API
├── stores/                     # Zustand stores
│   ├── auth.store.ts           # Auth state
│   └── ui.store.ts             # UI state
├── types/                      # TypeScript types
│   ├── auth.types.ts
│   ├── channel.types.ts
│   └── video.types.ts
├── config/                     # Configuration
│   └── site.ts                 # Site metadata
└── public/                     # Static assets
```

---

## 🎯 Implementation Phases

### Phase 1: Project Setup (Day 1)
- [x] Create Next.js 14 project with TypeScript
- [ ] Install dependencies
- [ ] Setup Tailwind + Shadcn/ui
- [ ] Configure environment variables
- [ ] Setup folder structure
- [ ] Create base layouts

### Phase 2: Authentication (Day 1-2)
- [ ] Auth context/store (Zustand)
- [ ] Login page
- [ ] Protected routes middleware
- [ ] API client with JWT interceptors
- [ ] Token refresh logic
- [ ] Test login flow

### Phase 3: Core Layout (Day 2)
- [ ] Dashboard layout with sidebar
- [ ] Navigation menu
- [ ] Header with user menu
- [ ] Loading states
- [ ] Error boundaries

### Phase 4: Channel Management (Day 3-4)
- [ ] Channel list page
- [ ] Channel create form
- [ ] Channel edit form
- [ ] Channel delete
- [ ] Streaming control (on-air/off-air)
- [ ] Test all CRUD operations

### Phase 5: Video Management (Day 4-5)
- [ ] Video list page with filters
- [ ] Video detail page
- [ ] Video create/edit forms
- [ ] Video delete
- [ ] YouTube search integration
- [ ] Test all CRUD operations

### Phase 6: User Management (Day 6)
- [ ] User list page
- [ ] User create/edit forms
- [ ] User roles & permissions
- [ ] Test user management

### Phase 7: Polish & Deploy (Day 7)
- [ ] Error handling
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Production build
- [ ] Docker setup

---

## 🛠️ Tech Stack Details

### Frontend Framework
- **Next.js 14** - App Router, Server Components
- **React 18** - Concurrent features
- **TypeScript 5** - Type safety

### UI Components
- **Shadcn/ui** - Radix UI + Tailwind
- **Tailwind CSS 3** - Utility-first CSS
- **Lucide React** - Icons

### State Management
- **TanStack Query v5** - Server state
- **Zustand** - Client state
- **React Context** - Auth context

### Data Fetching
- **Axios** - HTTP client
- **TanStack Query** - Caching, retries, mutations
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Styling
- **Tailwind CSS** - Utility classes
- **clsx / cn** - Conditional classes
- **CSS Modules** - Component-specific styles (optional)

### Development
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.309.0",
    "sonner": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 🎨 UI Components (Shadcn/ui)

Components to install:
- Button
- Input
- Label
- Card
- Table
- Dialog
- Dropdown Menu
- Select
- Form
- Toast (Sonner)
- Skeleton
- Badge
- Avatar
- Separator
- Tabs

---

## 🔐 Authentication Flow

```
User visits app
    ↓
Check auth state (Zustand store)
    ↓
    ├─ Authenticated → Dashboard
    │
    └─ Not authenticated → Login page
        ↓
        Enter credentials
        ↓
        POST /api/v1/auth/login
        ↓
        Store tokens (Zustand + localStorage)
        ↓
        Redirect to dashboard
        ↓
        All API calls include JWT header
        ↓
        If 401 → Auto refresh token
        ↓
        If refresh fails → Logout
```

---

## 📡 API Integration

### Service Layer Structure

```typescript
// services/auth.service.ts
export const authService = {
  login: (credentials: LoginInput) => Promise<AuthResponse>,
  refreshToken: (token: string) => Promise<TokenResponse>,
  getCurrentUser: () => Promise<User>,
  logout: () => void,
}

// services/channel.service.ts
export const channelService = {
  getAll: (params?: ChannelParams) => Promise<ChannelListResponse>,
  getById: (id: number) => Promise<Channel>,
  create: (data: ChannelCreate) => Promise<Channel>,
  update: (id: number, data: ChannelUpdate) => Promise<Channel>,
  delete: (id: number) => Promise<void>,
  turnOnAir: (id: number) => Promise<StreamingStatus>,
  turnOffAir: (id: number) => Promise<StreamingStatus>,
}

// services/video.service.ts
export const videoService = {
  getAll: (params?: VideoParams) => Promise<VideoListResponse>,
  getById: (id: number) => Promise<Video>,
  getByYoutubeId: (youtubeId: string) => Promise<Video>,
  create: (data: VideoCreate) => Promise<Video>,
  update: (id: number, data: VideoUpdate) => Promise<Video>,
  delete: (id: number) => Promise<void>,
  incrementView: (id: number) => Promise<void>,
}
```

---

## 🗂️ Data Fetching with TanStack Query

```typescript
// hooks/use-channels.ts
export function useChannels(params?: ChannelParams) {
  return useQuery({
    queryKey: ['channels', params],
    queryFn: () => channelService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// hooks/use-channel-create.ts
export function useChannelCreate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: channelService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Channel created successfully')
    },
  })
}
```

---

## 🎯 Key Features to Migrate

### From Existing App:

**Must Have:**
- ✅ Login/Logout with JWT
- ✅ Channel management (CRUD)
- ✅ Video management (CRUD)
- ✅ Streaming control (on-air/off-air)
- ✅ User management
- ✅ Dashboard with statistics
- ✅ Responsive design

**Nice to Have:**
- 🎹 Real-time updates (WebSocket)
- 📊 Advanced analytics
- 🎨 Dark mode
- 🔍 Advanced search & filters
- 📤 Export to CSV/Excel
- 🎯 Bulk operations

---

## 📝 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For deployment
NEXT_PUBLIC_API_URL=https://api-streamhub.uzone.id/api/v1
NEXT_PUBLIC_APP_URL=https://streamhub.uzone.id
```

---

## 🚀 Getting Started

Once created:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Shadcn/ui:** https://ui.shadcn.com
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://zustand-demo.pmnd.rs
- **FastAPI Backend:** http://localhost:8001/docs

---

## ⏭️ Next Steps

1. ✅ Create Next.js project
2. ✅ Setup TypeScript & ESLint
3. ✅ Install Shadcn/ui
4. ✅ Create folder structure
5. ✅ Setup API client
6. ✅ Build authentication
7. ✅ Build first page (channels)
8. ✅ Test with FastAPI backend
9. ✅ Deploy

---

**Status:** 🟢 Ready to start
**Timeline:** 7 days to MVP
**Priority:** High

**Last Updated:** 2026-02-25
