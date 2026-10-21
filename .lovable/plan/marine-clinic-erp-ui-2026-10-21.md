# Marine Clinic ERP UI

Build the requested clinic workspace as a responsive, mock-data-only application.

## Experience
- Replace the root placeholder with a professional medical operations dashboard and a mock sign-in screen.
- Add Admin and Staff demo role selection, with navigation and page access matching the requested role permissions.
- Provide a responsive collapsible sidebar, top header, dashboard summary, and dedicated views for patients, add patient, invoices, payments, staff, reports, activity logs, and settings.
- Use compact, useful sample records and working local interactions for navigation, search/filtering, patient entry, and mock sign-in/out.

## Technical details
- Implement within the existing TanStack Start React/TypeScript app, keeping the first screen at `/` and using existing shadcn/ui components and semantic design tokens.
- Keep all state and sample data local; do not enable Cloud or add a backend.
- Add route metadata and focused tests for role visibility/access behavior; record structural decisions in `AGENTS.md`.
