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
- **Modern Design** - Dark theme with game-inspired aesthetics
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Accessible Components** - Built with accessibility in mind
- **Real-time Feedback** - Loading states, error handling, and success notifications

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
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
   cd assettrackr-frontend
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
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
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
