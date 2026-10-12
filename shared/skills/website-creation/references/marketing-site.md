# Marketing website: brand to Nuxt handover

Use this path for public marketing pages, including agreed integrations with external services. Keep application features and databases out unless required and authorised through the business-site path. Follow the issued scope and reuse existing approved project decisions.

## 1. Establish the brand

Understand the business, audiences, products/services, locations, competitive differences, and primary visitor action. Ask for logos, guidelines, colours/fonts, brochures or presentations, existing website/social links, photography/video, and writing samples. Ask for comparable sites and what the customer likes or dislikes about their message, layout, imagery, or navigation. Review provided material before proposing a direction; use references for inspiration without copying identity, copy, or layouts.

Produce a concise brand guideline: positioning, personality, voice, logo usage, accessible colour combinations, typography, imagery, spacing, buttons, and recurring elements. If there is no established identity, offer a small number of coherent directions and show a visual example using available tools. Obtain customer approval of this concrete guideline before page design; record missing assets and any visual work the current host cannot produce.

## 2. Agree pages, content, and functionality

Recommend a structure around visitor needs. Consider Home, About, Services/product details, Projects/Case Studies, Testimonials, FAQs, Contact, and relevant policy pages. Recommend articles or location pages only when useful and maintainable.

For each page record purpose/audience, URL/navigation, message/sections/call to action, copy/images/evidence needed, functionality, and outstanding decisions. Develop rough notes with focused follow-ups. Never invent clients, testimonials, qualifications, awards, statistics, prices, or business claims; identify facts needing confirmation.

For enquiries, bookings, downloads, or subscriptions, agree fields, recipient, destination/service, delivery behaviour, validation, spam handling, and success/error states. An external service still needs account ownership and actual integration verification. Ask who maintains content and how often; choose files or a CMS based on that need, not by default. For a replacement site, inventory important existing URLs and plan redirects.

Obtain approval of the sitemap, content plan, and functionality before implementation. Do not turn a newly requested portal or stored workflow into an unapproved marketing feature; return to classification and Philo scope review.

## 3. Build and refine

For a new project, select a currently supported stable Nuxt release with TypeScript after checking official documentation. For an existing repository, inspect its supported version and conventions before changing dependencies; do not force an unrelated framework upgrade. Record runtime/package-manager versions and keep a dependency lockfile.

Prefer prerendered public HTML for static pages. Use SSR when justified and document any server or external service needed. Static output cannot execute a Nuxt server endpoint: agree a real form destination or server hosting, and make the build/output match that choice. Keep important public content in initial HTML. Consult current [Nuxt rendering guidance](https://nuxt.com/docs/4.x/guide/concepts/rendering) and [deployment guidance](https://nuxt.com/docs/4.x/getting-started/deployment); follow the documentation for the chosen major version.

Build the homepage, shared header/navigation/footer, reusable components, and consistent brand styling first. Show a working preview and obtain feedback on that design before extending remaining pages. Review one page or section at a time: identify exactly what to inspect and ask focused questions about message, layout, imagery, and call to action. Apply agreed changes and confirm the result. When requesting images, specify subject, orientation, approximate dimensions, and placement; prefer authentic business photography and record final asset rights. Track placeholders and missing copy without blocking independent work.

Throughout implementation:
- Cover mobile, tablet, and desktop layouts; semantic HTML, labelled forms, keyboard navigation, visible focus, contrast, and reduced motion.
- Optimise images/fonts, reserve image dimensions, and keep scripts and dependencies proportionate.
- Implement navigation, form validation, pending/success/failure states, and receiving-service validation/spam controls.
- Keep secrets out of source/browser bundles. Explain privacy/consent implications of the actual forms, tracking, and services.
- Test only authorised destinations with test data. A mocked success or HTTP acceptance alone does not prove an enquiry reached its recipient. If delivery cannot be checked, record it as outstanding and do not show a false delivery claim.

## 4. SEO and quality review

Implement SEO during development, then perform a separate final review against current [Google Search Central guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) and Nuxt documentation. Inspect every intended public page for useful original content, descriptive URLs, unique titles/descriptions, a clear main heading and logical hierarchy, crawlable links, canonicals, and indexing controls. Include intended canonical indexable pages in an XML sitemap. Use accurate image alt text (empty for decoration), social metadata/images, and structured data matching visible verified facts. Check broken links, duplicates, redirects, missing pages, and HTTP status codes. Avoid keyword stuffing, artificial location pages, and ranking promises.

Verify rendered HTML/metadata and real browser behaviour, including mobile/keyboard use, contrast, forms, errors, and performance. Use Lighthouse or equivalent as supporting evidence; distinguish lab measurements from field Core Web Vitals requiring live traffic. Run the production build and serve its actual output in preview, checking direct visits and refreshes on nested routes. Fix failures and investigate significant warnings. If execution/browser tools are unavailable, leave those checks untested.

Protect previews from indexing with appropriate access controls or noindex; robots.txt alone is insufficient. Document how Philo will enable production indexing and set the real canonical domain. Produce a report of passed, fixed, outstanding, and launch-dependent items, with commands/pages actually checked. Obtain final content/design approval before handover.

## 5. Handover to Philo

Prepare a source repository or project archive with final assets, lockfile, runtime requirements, and a README containing install/dev/build/preview commands. Include rendering/deployment output and hosting requirements, an environment example with descriptions and no secrets, approved brand/sitemap, content maintenance instructions, form/integration account ownership, asset licences, SEO/redirect settings, review evidence, and prioritised unresolved issues.

Supply a launch checklist for Philo: domain, HTTPS, environment, verified form delivery, redirects, canonicals, sitemap, indexing, applicable analytics/consent, and post-deployment checks. Confirm the authorised reviewer can access the handover through supported repository/attachment tools; otherwise state delivery is outstanding. Distinguish ready for production review from deployed and production-verified. Known blocking issues prevent a production-ready claim. Philo performs the live release.
