# Project Architecture

## Philosophy

The project should remain simple, modular and maintainable.

Prefer improving existing code over rewriting it.

---

## Folder Structure

src/

components/

views/

hooks/

lib/

services/

types/

utils/

---

## Responsibilities

components/

Reusable UI components only.

No business logic.

---

views/

Application pages.

Minimal logic.

Use services for data.

---

lib/

Shared configuration.

Examples:

- Supabase client
- Authentication

---

services/

All database interaction.

Examples:

- ideas.ts
- comments.ts
- departments.ts
- profiles.ts

Views should never directly communicate with Supabase.

---

hooks/

Reusable React hooks.

Example:

useAuth

---

types/

Shared TypeScript interfaces.

---

## Development Rules

Keep components small.

Reuse components.

Avoid duplicated logic.

Avoid unnecessary abstractions.

Only create new folders when they provide clear value.

---

## Backend

Supabase is the single backend.

No additional backend framework should be introduced unless absolutely necessary.

---

## State Management

Use React state.

Avoid Redux or other global state libraries unless the application genuinely requires them.

---

## Principle

Simple architecture scales better than clever architecture.
