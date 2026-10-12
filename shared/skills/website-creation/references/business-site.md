# Business website: data and workflow planning

Use this path when the requested site manages ongoing business data or user-specific workflows, whether or not a database product has been named. Examples include a customer portal, saved quotes, job tracking, member records, approvals, or inventory. A mixed site can retain a separate public marketing area.

## Define what must happen

Work through one real example from start to finish in plain language. Establish:
- Users and roles: who signs in, who can view/change which records, customer/company separation, and staff administration.
- Records: entities, essential fields/relationships, who creates/owns them, source of truth, and existing systems to integrate rather than duplicate.
- Workflows: creation, validation, state changes, approvals, notifications, failures, and what happens when two people edit the same record.
- Data needs: expected volume, sensitive information, attachments, retention/deletion/export, audit history, backups and recovery expectations.
- Integrations and operations: provider/account ownership, test environments, hosting, ongoing support, and which decisions Philo must make.

Produce a customer-readable requirements brief, example journeys, page/screen map, conceptual data model, role/access matrix, acceptance criteria, and unresolved decisions. Explain why persistence or a server is needed and where public content ends and private data starts. Reuse existing systems when suitable. Do not silently select a database, authentication vendor, paid service, or backend stack from a marketing-site prompt.

## Review before implementation

Get customer confirmation of the business needs and identify the architecture decisions for Philo. The default deliverable for this path is a requirements/architecture handoff. Business implementation proceeds only when the issued brief includes that work and supplies or records Philo's approved architecture, data boundaries, environment, and permitted actions. If already approved, use that approval without adding another gate. Customer design approval alone does not expand a marketing-only brief.

Keep the task type website_creation; record the selected business/mixed path in progress rather than rewriting the issued task. Save a scope proposal for new requirements through the working agreement. Continue authorised brand work or public pages while application decisions are outstanding. A labelled prototype with synthetic data can be useful if within scope; make clear that browser storage or mock records are not the agreed persistent backend or a secure multi-user system.

## When a business build is authorised

Inspect Philo's approved repository and stack; use Nuxt for the interface when specified, without assuming Nuxt determines the backend/database. Break work into reviewable user journeys and define how each will be verified. Use test accounts and synthetic records in the authorised environment.

Implement and test persistence across sessions, server-side validation, authentication/session behaviour, role and record-level permissions, denied access including another customer's records, data migrations under repository conventions, and workflow failure/retry behaviour. Private data must not enter prerendered pages, shared caches, public search metadata, or client secrets. Hiding a button is not permission enforcement. Do not substitute a polished mockup for working storage or claim integration success without observed results.

Apply the marketing guide's brand, accessibility, responsive design, content review, and source-handover practices where relevant. Apply public-page SEO only to intended public content; keep private areas access-controlled. Include data model/migrations, access rules, environment requirements, integration ownership, backup/recovery arrangements, and actual test results in the handover. Production migration, live transactions, and release remain with Philo.

Report unimplemented backend work and missing approvals as outstanding against any required build items. If the issued assignment is discovery only, an approved and delivered requirements brief can complete it; explicitly describe it as a plan, not a completed application.
