# Turborepo Maintenance Notes

> **Critical Configuration Areas to Maintain Carefully**

This document outlines the key configuration areas you need to maintain carefully in your Turborepo setup to avoid common pitfalls.

---

## 📋 Table of Contents

1. [Root `package.json` Configuration](#1-root-packagejson-configuration)
2. [`turbo.json` Task Configuration](#2-turbojson-task-configuration)
3. [Workspace Structure](#3-workspace-structure)
4. [Package Naming & Dependencies](#4-package-naming--dependencies)
5. [Task Dependencies & Execution Order](#5-task-dependencies--execution-order)
6. [Caching Configuration](#6-caching-configuration)
7. [Common Pitfalls & Solutions](#7-common-pitfalls--solutions)
8. [Maintenance Checklist](#8-maintenance-checklist)

---

## 1. Root `package.json` Configuration

### ⚠️ Critical Fields

```json
{
  "name": "my-turborepo",
  "private": true,                    // ✅ MUST be true for monorepos
  "packageManager": "bun@1.3.1",      // ⚠️ CRITICAL: Lock your package manager version
  "workspaces": [                      // ⚠️ CRITICAL: Must match your directory structure
    "apps/*",
    "packages/*"
  ]
}
```

### 🔴 What to Watch Out For:

- **`packageManager` field**: 
  - **MUST** match the package manager you're using (bun, npm, pnpm, yarn)
  - **MUST** include the version number
  - Changing this without updating lockfile causes issues
  - Example: `"packageManager": "bun@1.3.1"` means you're using Bun v1.3.1

- **`workspaces` array**:
  - Must exactly match your directory structure
  - If you add `apps/mobile/`, you don't need to update this (wildcard covers it)
  - If you create `tools/*` or `libs/*`, add them here: `"tools/*", "libs/*"`

- **Root scripts**:
  - These delegate to Turbo: `"build": "turbo run build"`
  - Don't add app-specific logic here
  - All actual task definitions go in `turbo.json`

---

## 2. `turbo.json` Task Configuration

### ⚠️ Critical Configuration

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",                         // Optional: UI mode (tui, stream, none)
  "tasks": {
    "build": {
      "dependsOn": ["^build"],         // ⚠️ CRITICAL: Runs dependencies first
      "inputs": ["$TURBO_DEFAULT$", ".env*"],  // ⚠️ What triggers rebuilds
      "outputs": [".next/**", "!.next/cache/**"]  // ⚠️ What gets cached
    },
    "dev": {
      "cache": false,                  // ⚠️ CRITICAL: Dev shouldn't cache
      "persistent": true               // ⚠️ CRITICAL: Dev runs continuously
    }
  }
}
```

### 🔴 What to Watch Out For:

#### **`dependsOn` Field**:
- `["^build"]` = Run `build` in dependencies FIRST, then this package
- `["build"]` = Run `build` in THIS package first, then this task
- `["^build", "test"]` = Run dependency builds + this package's test first
- **Missing dependencies** = Tasks run in wrong order = Broken builds

#### **`inputs` Field**:
- Defines what files trigger a cache invalidation
- `"$TURBO_DEFAULT$"` = Standard files (source code, configs)
- `.env*` = Environment files trigger rebuilds
- **Too broad** = Unnecessary rebuilds
- **Too narrow** = Stale cache hits

#### **`outputs` Field**:
- Defines what gets cached (build artifacts)
- `.next/**` = Cache Next.js build output
- `!.next/cache/**` = Don't cache Next.js cache (exclude pattern)
- **Missing outputs** = No caching = Slow builds
- **Wrong outputs** = Cached wrong files = Broken builds

#### **`cache` Field**:
- `true` (default) = Cache task results
- `false` = Never cache (use for `dev`, `watch`, etc.)
- **Caching `dev`** = Breaks hot reload

#### **`persistent` Field**:
- `true` = Task runs continuously (like `dev` server)
- `false` = Task completes and exits
- **Wrong setting** = Tasks hang or exit prematurely

---

## 3. Workspace Structure

### 📁 Current Structure

```
my-turborepo/
├── apps/
│   ├── docs/          # Next.js app
│   └── web/           # Next.js app
├── packages/
│   ├── ui/            # Shared React components
│   ├── eslint-config/ # Shared ESLint configs
│   └── typescript-config/ # Shared TS configs
├── package.json       # Root package.json
├── turbo.json         # Turbo configuration
└── bun.lock          # Lock file (or package-lock.json, pnpm-lock.yaml, yarn.lock)
```

### 🔴 What to Watch Out For:

- **Consistent naming**:
  - Apps: `apps/*` (web, docs, mobile, admin, etc.)
  - Packages: `packages/*` (ui, utils, configs, etc.)
  - Don't mix: `apps/` and `app/` or `packages/` and `libs/`

- **Package.json in each workspace**:
  - Every app/package MUST have its own `package.json`
  - Root `package.json` doesn't replace workspace ones

- **Lock file**:
  - **ONE lock file** at root (bun.lock, package-lock.json, etc.)
  - Don't commit `node_modules/` (in `.gitignore`)
  - Don't create lock files in workspaces

---

## 4. Package Naming & Dependencies

### ⚠️ Critical Patterns

#### **Internal Package Names**:
```json
// packages/ui/package.json
{
  "name": "@repo/ui",    // ⚠️ Use scoped names: @repo/*
  "exports": {
    "./*": "./src/*.tsx" // ⚠️ Define exports for internal packages
  }
}
```

#### **Consuming Internal Packages**:
```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/ui": "*",              // ⚠️ Use "*" for internal packages
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*"
  }
}
```

### 🔴 What to Watch Out For:

- **Scoped names** (`@repo/*`):
  - Prevents conflicts with npm packages
  - Makes internal packages obvious
  - Must match across all references

- **Version `"*"` for internal packages**:
  - Always use `"*"` for workspace packages
  - Don't use version numbers (e.g., `"^1.0.0"`)
  - Package manager resolves to local workspace

- **`exports` field**:
  - Required for modern package resolution
  - Defines what can be imported
  - Missing = Import errors

- **Dependency types**:
  - `dependencies`: Runtime dependencies (React, Next.js)
  - `devDependencies`: Build-time only (TypeScript, ESLint)
  - **Wrong placement** = Larger bundles or missing deps

---

## 5. Task Dependencies & Execution Order

### ⚠️ Understanding `dependsOn`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // Dependencies build first
    },
    "test": {
      "dependsOn": ["build"]   // This package builds first, then test
    },
    "deploy": {
      "dependsOn": ["^build", "build", "test"]  // All must complete
    }
  }
}
```

### 🔴 Execution Flow Example:

```
Package Graph:
  web (app)
    └── depends on @repo/ui (package)

When running: turbo build

1. @repo/ui builds first (no dependencies)
2. web builds second (after @repo/ui is ready)
```

### 🔴 What to Watch Out For:

- **`^build` vs `build`**:
  - `^build` = Dependencies' build task
  - `build` = This package's build task
  - **Confusion** = Circular dependencies or wrong order

- **Missing dependencies**:
  - If `web` uses `@repo/ui`, `web`'s build MUST depend on `^build`
  - Otherwise, `web` might build before `@repo/ui` = Import errors

- **Circular dependencies**:
  - Package A depends on Package B
  - Package B depends on Package A
  - **Result**: Build hangs or fails
  - **Solution**: Refactor to remove circular dependency

---

## 6. Caching Configuration

### ⚠️ Cache Strategy

```json
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "inputs": ["$TURBO_DEFAULT$"]  // No outputs (lint doesn't produce artifacts)
    },
    "dev": {
      "cache": false  // Never cache dev mode
    }
  }
}
```

### 🔴 What to Watch Out For:

- **`inputs` too broad**:
  - Including `node_modules/**` = Cache invalidates on every install
  - Including `.next/**` = Circular (outputs are inputs)

- **`inputs` too narrow**:
  - Missing config files = Stale cache when configs change
  - Missing `.env` files = Environment changes don't trigger rebuilds

- **`outputs` missing**:
  - No outputs defined = Nothing cached = Slow builds
  - Common outputs:
    - Next.js: `.next/**`, `!.next/cache/**`
    - React Library: `dist/**`
    - TypeScript: `dist/**`, `build/**`

- **Cache invalidation**:
  - Run `turbo build --force` to bypass cache
  - Clear cache: Delete `.turbo` folder
  - Remote cache: Use `turbo login` + `turbo link`

---

## 7. Common Pitfalls & Solutions

### 🔴 Pitfall #1: Package Manager Mismatch

**Problem**: `packageManager` says `bun@1.3.1` but using npm

**Symptoms**: 
- Lock file conflicts
- Dependency resolution issues
- Inconsistent installs

**Solution**:
```bash
# Always use the specified package manager
bun install  # ✅ Correct (matches packageManager field)
npm install  # ❌ Wrong
```

---

### 🔴 Pitfall #2: Missing Task Dependencies

**Problem**: `web` app uses `@repo/ui` but `turbo.json` doesn't specify dependency

**Symptoms**:
- Random build failures
- "Module not found" errors
- Works sometimes, fails other times

**Solution**:
```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // ✅ Ensures dependencies build first
    }
  }
}
```

---

### 🔴 Pitfall #3: Wrong Cache Configuration

**Problem**: Caching `dev` task or missing `outputs` for `build`

**Symptoms**:
- Dev server shows stale code
- Builds are slow (no caching)
- CI/CD is slow

**Solution**:
```json
{
  "tasks": {
    "dev": {
      "cache": false,      // ✅ Never cache dev
      "persistent": true   // ✅ Dev runs continuously
    },
    "build": {
      "outputs": [".next/**"]  // ✅ Cache build outputs
    }
  }
}
```

---

### 🔴 Pitfall #4: Workspace Path Mismatch

**Problem**: Created `libs/` folder but `package.json` only has `packages/*`

**Symptoms**:
- Packages in `libs/` not recognized
- Can't import from `libs/` packages
- Workspace commands don't include `libs/`

**Solution**:
```json
// Root package.json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "libs/*"  // ✅ Add new workspace paths
  ]
}
```

---

### 🔴 Pitfall #5: Internal Package Version Numbers

**Problem**: Using version numbers for internal packages

**Symptoms**:
- Package manager can't resolve workspace packages
- Installs from npm instead of local workspace

**Solution**:
```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/ui": "*"  // ✅ Use "*" for workspace packages
    // "@repo/ui": "^1.0.0"  // ❌ Wrong
  }
}
```

---

### 🔴 Pitfall #6: Missing `exports` in Package.json

**Problem**: Internal package doesn't define `exports`

**Symptoms**:
- Import errors: "Cannot find module '@repo/ui'"
- TypeScript errors
- Works in some places, fails in others

**Solution**:
```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    "./*": "./src/*.tsx"  // ✅ Define what can be imported
  }
}
```

---

## 8. Maintenance Checklist

### ✅ Daily/Weekly Checks

- [ ] All apps/packages have `package.json` with correct `name` field
- [ ] Internal packages use `@repo/*` naming convention
- [ ] Internal dependencies use `"*"` version
- [ ] Root `packageManager` matches actual package manager
- [ ] `workspaces` array matches directory structure

### ✅ When Adding New Packages

- [ ] Create package in correct directory (`apps/` or `packages/`)
- [ ] Add `package.json` with scoped name (`@repo/package-name`)
- [ ] Define `exports` field if it's a library
- [ ] Add to consuming packages' `dependencies`/`devDependencies`
- [ ] Update `turbo.json` if new task types are needed
- [ ] Test: `turbo build --filter=package-name`

### ✅ When Adding New Tasks

- [ ] Define task in `turbo.json`
- [ ] Set correct `dependsOn` (use `^task` for dependencies)
- [ ] Configure `inputs` (what triggers rebuild)
- [ ] Configure `outputs` (what gets cached) - if applicable
- [ ] Set `cache: false` for dev/watch tasks
- [ ] Set `persistent: true` for long-running tasks
- [ ] Test: `turbo run task-name`

### ✅ When Modifying Dependencies

- [ ] Update package's `package.json`
- [ ] Run install: `bun install` (or your package manager)
- [ ] Verify lock file updated
- [ ] Check if `turbo.json` needs `dependsOn` updates
- [ ] Test build: `turbo build`

### ✅ Before Committing

- [ ] Run `turbo build` - all packages build successfully
- [ ] Run `turbo lint` - no linting errors
- [ ] Run `turbo check-types` - no type errors
- [ ] Verify `.turbo` is in `.gitignore` (don't commit cache)
- [ ] Verify `node_modules` is in `.gitignore`
- [ ] Commit lock file (`bun.lock`, `package-lock.json`, etc.)

### ✅ When Troubleshooting

1. **Clear cache**: Delete `.turbo` folder
2. **Fresh install**: Delete `node_modules`, reinstall
3. **Check dependencies**: `turbo build --graph` (if available)
4. **Force rebuild**: `turbo build --force`
5. **Check logs**: `turbo build --output-logs=full`

---

## 📚 Quick Reference

### Common Commands

```bash
# Build all packages
turbo build

# Build specific package
turbo build --filter=web

# Build package and dependencies
turbo build --filter=web...

# Dev mode (all apps)
turbo dev

# Dev mode (specific app)
turbo dev --filter=web

# Lint all
turbo lint

# Clear cache
rm -rf .turbo

# Force rebuild (ignore cache)
turbo build --force
```

### File Locations

- **Root config**: `/package.json`, `/turbo.json`
- **Workspace configs**: `/apps/*/package.json`, `/packages/*/package.json`
- **Cache**: `/.turbo/` (gitignored)
- **Lock file**: `/bun.lock` (or `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)

---

## 🎯 Key Takeaways

1. **Always match `packageManager`** - Use the exact version specified
2. **Use `dependsOn: ["^build"]`** - For packages that depend on others
3. **Never cache `dev` tasks** - Set `cache: false`
4. **Use `"*"` for internal packages** - Don't use version numbers
5. **Keep `workspaces` in sync** - Match your directory structure
6. **Define `outputs` for build tasks** - Enable caching
7. **Use scoped names** - `@repo/*` for internal packages

---

**Last Updated**: Based on Turborepo v2.6.3 with Bun v1.3.1

