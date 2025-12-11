# Custom Printing E-commerce Platform

A full-stack monorepo for a custom printing e-commerce platform (t-shirts, mugs, hoodies, etc.) built with modern technologies.

## 🏗️ Tech Stack

- **Frontend**: Next.js 16.0.7 (App Router, TypeScript)
- **Backend**: Bun 1.3.1 + Express.js
- **Monorepo**: Turborepo 2.6.3
- **Package Manager**: Bun 1.3.1
- **Node.js**: v22.17.1
- **TypeScript**: 5.9.2

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Versions (MUST MATCH)

- **Bun**: `1.3.1` ([Installation Guide](https://bun.sh/docs/installation))
- **Node.js**: `v22.17.1` (Use `.nvmrc` file if using nvm)

### Verify Your Versions

```bash
# Check Bun version
bun --version
# Should output: 1.3.1

# Check Node.js version
node --version
# Should output: v22.17.1
```

### Installing Node.js with nvm (Recommended)

If you're using `nvm` (Node Version Manager):

```bash
# Install/use the correct Node.js version
nvm install 22.17.1
nvm use 22.17.1

# Or simply run (if .nvmrc exists)
nvm use
```

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd my-turborepo
```

### Step 2: Install Dependencies

```bash
# Install all dependencies for all workspaces
bun install
```

This will install dependencies for:
- Root workspace
- All apps (`apps/web`, `apps/api`)
- All packages (`packages/ui`, `packages/types`, etc.)

### Step 3: Set Up Environment Variables

#### Frontend (apps/web)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (apps/api)

Create `apps/api/.env`:

```env
PORT=3001
NODE_ENV=development
```

### Step 4: Start Development Servers

#### Option A: Start All Apps (Recommended)

```bash
# Start both frontend and backend
bun run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

#### Option B: Start Individual Apps

```bash
# Start only the frontend
bun run dev --filter=web

# Start only the backend
bun run dev --filter=api
```

### Step 5: Verify Everything Works

1. **Frontend**: Open http://localhost:3000 in your browser
2. **Backend**: Open http://localhost:3001/health in your browser (should return `{"status":"ok"}`)

## 📁 Project Structure

```
my-turborepo/
├── apps/
│   ├── web/              # Next.js frontend application
│   │   ├── app/          # Next.js App Router pages
│   │   ├── public/       # Static assets
│   │   └── package.json
│   └── api/               # Bun + Express backend API
│       ├── src/
│       │   └── index.ts  # Express server entry point
│       └── package.json
├── packages/
│   ├── ui/                # Shared React UI components
│   ├── types/             # Shared TypeScript types
│   ├── eslint-config/     # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
├── package.json           # Root package.json
├── turbo.json             # Turborepo configuration
├── .editorconfig          # Editor configuration
├── .prettierrc            # Prettier configuration
├── .nvmrc                 # Node.js version specification
└── README.md
```

## 📜 Available Scripts

### Root Level Scripts

Run these from the root directory:

```bash
# Development
bun run dev              # Start all apps in development mode

# Build
bun run build            # Build all apps and packages

# Code Quality
bun run lint             # Lint all packages
bun run check-types      # Type-check all packages
bun run format           # Format code with Prettier

# Specific app/package
bun run dev --filter=web    # Start only web app
bun run dev --filter=api    # Start only API server
bun run build --filter=web  # Build only web app
```

### App-Specific Scripts

#### Frontend (apps/web)

```bash
cd apps/web

bun run dev      # Start Next.js dev server (port 3000)
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

#### Backend (apps/api)

```bash
cd apps/api

bun run dev      # Start Express server (port 3001)
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

## 🔧 Configuration Files

### Workspace-Wide Configs

These files apply to the entire monorepo:

- **`.editorconfig`**: Editor settings (indentation, line endings, etc.)
- **`.prettierrc`**: Code formatting rules
- **`.prettierignore`**: Files to exclude from formatting
- **`.nvmrc`**: Node.js version specification
- **`.gitignore`**: Git ignore patterns

### Package Manager

The project uses **Bun 1.3.1** as specified in `package.json`:

```json
"packageManager": "bun@1.3.1"
```

**Important**: Always use `bun` commands, not `npm`, `yarn`, or `pnpm`.

## 🎯 Development Workflow

### Adding a New Package

1. Create package in `packages/` directory
2. Add `package.json` with scoped name (`@repo/package-name`)
3. Add to consuming packages' dependencies
4. Update `turbo.json` if needed

### Adding a New App

1. Create app in `apps/` directory
2. Add `package.json` with app name
3. Configure in `turbo.json` if needed
4. Add to root `workspaces` array (if using custom paths)

### Using Shared Types

Import shared types from `@repo/types`:

```typescript
import { Product, Order, OrderStatus } from "@repo/types";
```

### Using Shared UI Components

Import shared components from `@repo/ui`:

```typescript
import { Button, Card } from "@repo/ui";
```

## 🧪 Testing

```bash
# Run tests (when implemented)
bun run test

# Run tests for specific package
bun run test --filter=web
```

## 🏗️ Building for Production

```bash
# Build all apps and packages
bun run build

# Build specific app
bun run build --filter=web
bun run build --filter=api
```

## 📦 Remote Caching (Optional)

Turborepo supports remote caching to share build artifacts across machines and CI/CD.

### Setup Remote Caching

1. **Login to Vercel**:

```bash
bunx turbo login
```

2. **Link your repository**:

```bash
bunx turbo link
```

This enables:
- Faster CI/CD builds
- Shared cache across team members
- Better build performance

## 🐛 Troubleshooting

### Issue: Wrong Node.js Version

**Solution**: Use the version specified in `.nvmrc`:

```bash
nvm use
```

### Issue: Wrong Bun Version

**Solution**: Install the correct Bun version:

```bash
# Install Bun 1.3.1
curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.1"
```

### Issue: Dependencies Not Installing

**Solution**: Clear cache and reinstall:

```bash
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm bun.lock
bun install
```

### Issue: Build Failures

**Solution**: Clear Turborepo cache:

```bash
rm -rf .turbo
bun run build
```

### Issue: Type Errors

**Solution**: Rebuild shared packages first:

```bash
bun run build --filter=@repo/types
bun run check-types
```

## 📚 Additional Resources

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Ensure you're using the correct versions (Bun 1.3.1, Node.js v22.17.1)
2. Follow the code style defined in `.editorconfig` and `.prettierrc`
3. Run `bun run lint` and `bun run check-types` before committing
4. Format code with `bun run format`

## 📝 Version Information

This project uses the following versions (DO NOT CHANGE without team discussion):

- **Bun**: `1.3.1`
- **Node.js**: `v22.17.1`
- **Next.js**: `^16.0.7`
- **React**: `^19.2.0`
- **TypeScript**: `5.9.2`
- **Turborepo**: `^2.6.3`

To ensure consistency across the team, always verify your versions match these before starting development.

---

**Happy Coding! 🚀**
# print-e-com
