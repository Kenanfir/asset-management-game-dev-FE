# AssetTrackr - Game Asset Management Frontend

A modern Next.js frontend for managing game assets with version control, validation, and automated delivery workflows.

## 🎮 Features

### Core Functionality
- **Project Management** - Connect and manage multiple game repositories
- **Asset Table** - Centralized view of all game assets with filtering and search
- **Version Control** - Track asset versions with detailed history and change tracking
- **Validation Pipeline** - Automated asset validation with rule-based quality checks
- **Bulk Operations** - Add multiple assets and upload files in batches
- **Real-time Updates** - Live progress tracking for upload jobs and validation

### Asset Management
- **Type System** - Comprehensive asset type definitions (sprites, textures, audio, 3D models)
- **Rule Packs** - Configurable validation rules per asset type
- **Status Tracking** - Visual status indicators (needed, in_progress, review, done, needs_update)
- **Assignee Management** - Assign assets to team members
- **History Browser** - Complete version history with notes and validation findings

### File Upload & Processing
- **Drag & Drop** - Intuitive file upload with react-dropzone
- **Format Validation** - Client-side validation based on asset type rules
- **Auto-conversion** - Automatic format conversion with lossy/lossless indicators
- **Progress Tracking** - Real-time upload progress with status updates
- **Bulk Upload** - Upload multiple files simultaneously

### User Interface
- **Modern Design** - Dark theme with game-inspired aesthetics and cyan accents
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Accessible Components** - Built with accessibility in mind
- **Real-time Feedback** - Loading states, error handling, and success notifications
- **Inline Editing** - Edit asset keys and status directly in the table
- **Smooth Interactions** - Proper event handling prevents unwanted popups

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v3** - Utility-first styling with custom design system
- **shadcn/ui** - High-quality component library

### State Management
- **TanStack Query** - Server state management with caching
- **Zustand** - Lightweight client state management
- **React Hook Form** - Form state management

### File Handling
- **react-dropzone** - Drag and drop file uploads
- **File API** - Native file handling and validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   The `.env.local` file is already configured with default values. You can modify these if needed:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
assettrackr-frontend/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   ├── projects/                # Project pages
│   ├── signin/                  # Authentication
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── asset-drawer.tsx         # Asset detail drawer
│   ├── asset-table.tsx          # Main asset table
│   ├── bulk-operations.tsx      # Bulk upload/add operations
│   ├── file-upload.tsx          # File upload component
│   └── upload-jobs.tsx          # Upload job tracking
├── lib/                         # Utilities and configurations
│   ├── hooks/                   # Custom React hooks
│   ├── mock/                    # Mock data for development
│   ├── api.ts                   # API client
│   ├── query-client.ts          # TanStack Query configuration
│   ├── rule-packs.ts            # Asset validation rules
│   ├── store.ts                 # Zustand store
│   └── types.ts                 # TypeScript type definitions
└── public/                      # Static assets
```

## 🎯 Key Components

### Asset Table
The main interface for managing game assets:
- **Filtering** - By status, type, and search terms
- **Sorting** - Click column headers to sort
- **Bulk Selection** - Select multiple assets for batch operations
- **Quick Actions** - View details, mark for update, upload files

### Asset Drawer
Detailed view for individual assets:
- **Summary** - Asset information and current files
- **History** - Version history with validation findings
- **Rules** - Applied validation rules and requirements
- **Needs Update** - Issues and update requests

### File Upload
Advanced file upload with validation:
- **Drag & Drop** - Intuitive file selection
- **Format Validation** - Real-time format checking
- **Progress Tracking** - Upload progress and status
- **Error Handling** - Clear error messages and recovery

## 🔧 Configuration

### Asset Types
Configure supported asset types in `lib/rule-packs.ts`:

```typescript
export const RULE_PACKS: RulePack[] = [
  {
    asset_type: "sprite_static",
    formats: ["png", "tga", "webp"],
    rules: {
      max_width: 4096,
      max_height: 4096,
      // ... more rules
    },
  },
  // ... more asset types
]
```

### API Configuration
Configure API endpoints in `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
```

## 🚀 Deployment

### Coolify (Self-Hosted)

Coolify is a self-hosted alternative to Vercel/Netlify that you can deploy on your own server. Here's how to deploy AssetTrackr with Coolify:

#### Prerequisites
- A server with Docker installed
- Coolify instance running (see [Coolify Installation Guide](https://coolify.io/docs/installation))
- Your repository hosted on GitHub, GitLab, or Bitbucket

#### Deployment Steps

1. **Create New Project in Coolify**
   - Log into your Coolify dashboard
   - Click "New Project" or "Add Resource"
   - Select "Git Repository" as source

2. **Connect Repository**
   - Enter your repository URL: `https://github.com/yourusername/AssetManagerGameDev`
   - Select the branch you want to deploy (usually `main` or `master`)
   - Choose "Next.js" as the application type

3. **Configure Build Settings**
   ```
   Build Pack: Next.js
   Build Command: pnpm build
   Start Command: pnpm start
   Node Version: 18.x (or latest LTS)
   ```

4. **Set Environment Variables**
   In the Coolify environment variables section, add:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   PORT=3000
   ```

5. **Configure Build Context**
   - **Root Directory**: `asset-management-game-dev-FE`
   - **Dockerfile**: (Leave empty to use Coolify's auto-detection)
   - **Build Context**: `asset-management-game-dev-FE`

6. **Advanced Configuration (Optional)**
   If you need custom Docker configuration, create a `Dockerfile` in the frontend directory:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   # Install dependencies based on the preferred package manager
   COPY package.json pnpm-lock.yaml* ./
   RUN corepack enable pnpm && pnpm i --frozen-lockfile
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Next.js collects completely anonymous telemetry data about general usage.
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN corepack enable pnpm && pnpm build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   
   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next
   
   # Automatically leverage output traces to reduce image size
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

7. **Deploy**
   - Click "Deploy" in Coolify
   - Monitor the build logs for any issues
   - Once deployed, your app will be available at the provided URL

#### Custom Domain Setup
1. In Coolify, go to your project settings
2. Navigate to "Domains" section
3. Add your custom domain (e.g., `assettrackr.yourdomain.com`)
4. Configure DNS records as instructed by Coolify
5. Enable SSL certificate (Coolify handles this automatically with Let's Encrypt)

#### Environment-Specific Configuration

**Development Environment:**
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Production Environment:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

#### Monitoring & Logs
- **Build Logs**: Available in Coolify dashboard during deployment
- **Runtime Logs**: Accessible in the "Logs" tab of your project
- **Health Checks**: Coolify automatically monitors your application health

#### Troubleshooting Coolify Deployment

**Common Issues:**

1. **Build Fails with "pnpm not found"**
   - Ensure Node.js version is 18+ in Coolify settings
   - Add `corepack enable pnpm` to build command

2. **Port Issues**
   - Make sure your app listens on `0.0.0.0:3000`
   - Check that `PORT` environment variable is set

3. **Memory Issues**
   - Increase memory limit in Coolify project settings
   - Consider using `--max-old-space-size=4096` in build command

4. **Static File Issues**
   - Ensure `next.config.mjs` has `images: { unoptimized: true }` for static hosting
   - Check that all static assets are in the `public` directory

#### Scaling with Coolify
- **Horizontal Scaling**: Use Coolify's scaling features to run multiple instances
- **Load Balancing**: Coolify automatically handles load balancing
- **Resource Limits**: Set CPU and memory limits in project settings

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- **Netlify** - Static export or serverless functions
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

## 🧪 Development

### Mock Data
The app includes comprehensive mock data for development:
- **Projects** - Sample game projects
- **Assets** - Various asset types with validation findings
- **Upload Jobs** - Simulated upload processing
- **Users** - Team member data

### API Fallbacks
The API client automatically falls back to mock data when the backend is unavailable, making development seamless.

### Testing
```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Build for production
pnpm build
```

## 🔧 Troubleshooting

### Common Issues

#### Styling Not Loading
If the app appears unstyled or with overlapping elements:
1. Ensure you're using the correct Tailwind CSS version (v3.4.0+)
2. Check that `postcss.config.mjs` is properly configured
3. Verify `tailwind.config.ts` exists and is properly set up
4. Restart the development server: `pnpm dev`

#### Inline Editing Issues
If clicking on editable fields opens the asset drawer:
1. This has been fixed in the latest version
2. Ensure you're using the updated `inline-edit.tsx` component
3. The fix includes proper event propagation handling

#### Build Errors
If you encounter build errors:
1. Clear the Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Check for TypeScript errors: `pnpm type-check`

## 📋 Recent Updates

### v1.1.0 - Styling & UX Improvements
- **Fixed CSS Styling Issues** - Resolved OKLCH to HSL color format mismatch
- **Improved Dark Theme** - Enhanced dark theme with proper background colors and cyan accents
- **Fixed Inline Editing** - Resolved click event bubbling that caused unwanted drawer popups
- **Updated Dependencies** - Upgraded to Tailwind CSS v3 and Next.js 15
- **Enhanced Layout** - Fixed overlapping elements and transparent backgrounds

### v1.0.0 - Initial Release
- Complete asset management system
- Project-based organization
- Real-time validation and upload tracking
- Modern dark theme UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the component examples

---

**Built with ❤️ for game developers**
