# Evo Manager Agent Guidelines

## 🛠 Coding Philosophy
- **Anti-Defensive**: Abhor defensive code. No safe navigation or null checks to hide upstream issues. Errors should surface early; null/undefined handling belongs strictly to business logic.
- **Simplicity First**: Rely on framework/library defaults. Do not stray from standard patterns unless explicitly requested.
- **SPA Architecture**: Pure SPA with `ssr: false`. Use `clientLoader` and `clientAction`.

## 🎨 UI Guidelines
- **Location**: All building blocks in `app/components/ui/`.
- **Abstraction**: Wrap `base-ui` primitives into easy-to-use, styled components.
- **Encapsulation**: UI components handle their own low-level boilerplate (Portals, Backdrops, etc.).
- **Style**: Tailwind 4, premium aesthetics, focus on micro-animations and smooth transitions.

## 🧪 Testing Guidelines
- **Framework**: Vitest + `happy-dom`.
- **Colocation**: Test files must sit alongside the component (`*.test.tsx`).
- **Scope**: Focus on component behavior and accessibility. Avoid implementation detail testing.

## 📦 Dependency Management
- **Installation**: Always use `pnpm install <pkg>`. Do not manually edit `package.json`.
