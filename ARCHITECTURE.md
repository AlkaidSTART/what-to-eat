# Project Architecture & Guidelines

## 1. Technology Stack

### Core Framework
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Package Manager**: [pnpm](https://pnpm.io/)

### Data Layer
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management (Client)**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching (Server State)**: [TanStack Query](https://tanstack.com/query/latest)

### UI & Styling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

### Validation & Forms
- **Schema Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)

### Authentication
- **Auth**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/)

---

## 2. Engineering Standards

### Directory Structure
```
src/
├── app/                 # Next.js App Router (Pages, Layouts, API)
├── components/          # React Components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── feature/         # Feature-specific components
├── lib/                 # Utilities, Constants, Prisma Client
├── hooks/               # Custom React Hooks
├── store/               # Zustand Stores
├── types/               # Global TypeScript Types
├── prisma/              # Database Schema & Migrations
└── actions/             # Server Actions
```

### Naming Conventions
- **Files**: `kebab-case` (e.g., `user-profile.tsx`, `route.ts`)
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions/Variables**: `camelCase`
- **Types/Interfaces**: `PascalCase`

### Git Workflow
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation
  - `style`: Formatting
  - `refactor`: Code restructuring
  - `test`: Adding tests
  - `chore`: Build/Tools
- **Branches**: Feature branches from `main`, PR required for merge.

---

## 3. Security Guidelines

### Authentication & Authorization
- **Middleware**: Protect private routes using `middleware.ts`.
- **Server Actions**: Verify authentication session inside every Server Action.
- **RBAC**: Implement Role-Based Access Control where necessary.

### Data Protection
- **Environment Variables**: Store secrets in `.env`. NEVER commit `.env` to Git.
- **Input Validation**: Validate ALL inputs using Zod schemas on both client and server.
- **CSRF**: Leverage Next.js built-in CSRF protection for Server Actions.
- **SQL Injection**: Use Prisma ORM to prevent SQL injection vulnerabilities.

### Best Practices
- **Strict Mode**: Ensure TypeScript strict mode is always enabled.
- **Linter**: No `eslint-disable` without explicit justification.
