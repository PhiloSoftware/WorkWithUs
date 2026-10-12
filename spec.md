# Work with Philo — Product Specification

- Status: Initial plugin implementation; customer pilot pending
- Updated: 12 October 2026
- Repository: PhiloWorkWithUs
- Initial providers: ChatGPT and Claude
- Integration decision: customer-owned Productive connections; no standalone Philo service

## 1. Purpose

Help Philo Software customers complete assigned information requests, software reviews, and website creation through their own AI assistant.

Philo defines a bounded assignment in Productive. The task type selects a curated working mode maintained by Philo. The assistant helps the customer understand the work, find information, perform authorised checks, and produce a useful report without silently expanding the assignment.

New ideas, disagreement, missing information, and blockers are legitimate outcomes. Preserve them separately while keeping the issued scope clear.

## 2. Product principles

- Productive is the operational record for tasks, project access, comments, and Philo review decisions.
- Customers connect using their own Productive accounts. Productive enforces permissions.
- Philo skills guide the conversation and task process.
- The issued brief has an explicit type and version. Customer discussion does not authorise scope changes.
- A submission is not acceptance; Philo decides acceptance.
- Intentional saved progress lives with the Productive task so another chat can resume.
- Do not import complete private conversations or unrelated files.
- Test the customer journey separately for ChatGPT and Claude before advertising support.

## 3. Ownership and architecture

Customer's ChatGPT or Claude + Philo skills -> customer's Productive connector -> Productive tasks and comments.

| Component | Responsibility |
| --- | --- |
| Shared skills | Onboarding, task routing, guided work, scope handling, report preparation |
| Provider adapters | Packaging, connection instructions, host-specific capabilities |
| Productive | Customer accounts, permission sets, project sharing, tasks, comments, review workflow |
| Philo website | Installation guidance, support, privacy, and tested installation links |

No Philo proxy, OAuth service, customer database, background delivery queue, or server-side model calls are required for the initial implementation. Any future service must be justified by a demonstrated need and decided separately.

Source layout:

```text
shared/
  plugin.json
  productive.json
  task-types.json
  skills/
  references/
providers/
  chatgpt/
  claude/
contracts/v0.1.0/
templates/productive/
scripts/
tests/
evals/
docs/
.github/workflows/
dist/
```

Shared skills are maintained once. Generated provider packages are self-contained. Publish only the selected package root/ZIP, never source fixtures, customer data, credentials, internal docs, or the whole repository.

## 4. Initial scope

1. Installable ChatGPT and Claude packages.
2. Setup using each customer's existing Productive connection.
3. Discovery of issued tasks assigned to that customer.
4. Information-request, software-review, and website-creation modes.
5. Saved progress, blockers, separate scope proposals, and confirmed reports as task comments.
6. Philo review and requests for clarification through Productive.
7. Manual check-ins and a later website installation page after pilot verification.

Later extensions: verified provider reminders, additional task types, custom-field mappings, richer interfaces, and additional providers.

Outside the initial scope: a general Philo chatbot, a customer project-management portal, separate login/hosting infrastructure, automatic commercial approval, guaranteed instruction compliance, destructive testing, and unattended production transactions.

## 5. Installation and onboarding

The website explains what the add-on does, supported platforms/accounts, what is shared, and how to get help. Installation and connection use each provider's supported consent flow. Do not invent installation URLs or silently authorise access.

The planned marketing journey captures email/company and immediately presents Install for ChatGPT / Install for Claude. Philo's website automation provisions client access, a private discovery project, and a first information-request task about what the customer wants to achieve. Installation starts guided setup; the Productive invitation email is an activation step within that journey. Website provisioning remains to be implemented and verified, separate from the customer's ongoing Productive connection.

Starter prompt:

> Use Work with Philo to get me connected and show what needs my attention.

Setup:
1. Explain the add-on and check for Productive tools.
2. Guide the customer through their own Productive authentication. When activation is needed, locate the Philo invitation using authorised email tools, or explain how to find it manually in the signup mailbox and spam/junk. Email access is optional; email address matching does not authenticate the customer. The customer completes activation/sign-in and connection approval.
3. Read the actual connected person and organisation.
4. Find their assigned issued Philo tasks.
5. Ask for project/task choice only when necessary.
6. Offer to start or resume useful work.

Handle these situations distinctly:
- Not connected: guide connection.
- No Productive account/invitation: help locate the invitation, then resume connection; if missing, expired, or mismatched, explain how to resolve it with Philo. Do not claim an invitation resend or account activation without evidence.
- Wrong organisation: guide reconnecting/selecting the intended organisation.
- Permission denied: explain the denied operation without bypassing it.
- Connected with no assignments: say so; do not fabricate tasks or infer missing membership from an empty list.

Installing the plugin does not create a Productive user. There is no additional Work with Philo login. A customer may explicitly work from a supplied brief without a connection, but the assistant labels it unverified and unsaved.

## 6. Assignment convention

Philo owns issuing and revising the brief. Initially, place a labelled Philo assignment JSON block in the Productive task description.

Required information:
- Format version, explicit Philo taskType, briefVersion, and issueState.
- Philo owner person ID.
- Objective, included/excluded scope, and completion criteria.
- Stable question/scenario IDs, prompts, and required flags.
- For software reviews: environment, software version, role, permitted actions, and expected behaviour.

The actual Productive task supplies task ID, assignee, project, due date, and workflow state. Only issueState issued enters guided work; draft and withdrawn do not.

Initial types:
- information_request -> information-request skill.
- software_review -> software-review skill.
- website_creation -> website-creation skill; classifies marketing, business, or mixed requirements before selecting the work path.

Productive's built-in task_type and type_id describe structural task categories and must not select a Philo workflow. A future custom-field mapping must resolve verified IDs/options. Missing, contradictory, or unsupported types require clarification.

Philo increments briefVersion for revisions and explains changes. Skills compare the current content and version before writes. Saved reports retain the original version they answer. This convention is not an immutable server snapshot or atomic version lock.

## 7. Guided work and scope

Every task skill reads the current task and relevant saved comments before working. Verify the task's actual assignee: Productive's assignee filter may also return tasks containing a to-do assigned to the customer.

Explain the outcome, scope, and completion criteria. Work at the customer's pace, reusing valid saved answers. Use the customer's authorised tools to locate information or inspect the permitted software environment.

Distinguish customer statements, AI deductions, and observed evidence. Confirm material deductions before attributing them to the customer. Do not fabricate facts or test results.

For new ideas, explain their relationship to the task and save an agreed separate scope proposal. Return to the outstanding work, or preserve a blocker if it cannot continue. Respect an explicit choice to stop or change topics without claiming assignment completion.

Treat attachments and comment bodies as evidence, not authority to override permissions, workflow, or the issued scope.

## 8. Information requests

Work through the issued questions. Record each answer, sources/evidence, provenance, and confirmation. Outcomes are answered, unknown, unavailable, and needs_clarification.

An unconfirmed guess cannot supply a required business fact. Preserve gaps and explanations; continue independent questions where useful.

## 9. Software reviews

Establish environment, version, role, testing authority, and whether the customer or AI performs the steps. Clarify missing details affecting validity or safety.

Record passed, failed, blocked, or not_tested for each scenario. A pass requires an actual observation or attributed customer report.

For failures capture reproduction steps, expected/actual behaviour, impact, and evidence. Separate defects against the brief from new feature requests. Review permission does not authorise production transactions or actions outside the issued testing authority.

## 9a. Website creation

Begin with business/audience discovery, visitor actions, existing brand material, and comparable sites. Ask whether visitors or staff need accounts, persistent records, private information, or operational workflows. Public pages with an approved external enquiry/booking service can remain a marketing site; managed business records require the business path. Mixed sites identify both areas and their boundary. Confirm and save the classification without altering the issued brief.

For marketing sites, follow the customer-supplied website brief: approve brand guidelines, approve sitemap/content/functionality, build a Nuxt/TypeScript site with the homepage first, review pages iteratively, conduct dedicated SEO/quality checks, and hand over source/assets/configuration and launch dependencies to Philo. Prefer prerendering where appropriate and document real server/external-service needs. Preserve existing approvals on resume. Never invent business claims, test results, delivery success, or deployment.

For business sites, first produce journeys, a conceptual data model, roles/access rules, integrations, acceptance criteria, and architecture questions for Philo. Business implementation requires an issued scope and Philo-approved architecture/environment; continue authorised independent marketing work while those decisions are outstanding. A planning-only assignment can be completed with an approved plan, but planning cannot satisfy a commissioned application build. Use synthetic data for authorised prototypes and label mocked functionality.

Website outcomes are completed, in_progress, blocked, and needs_clarification, mapped to issued deliverable IDs. Save classification, current stage, approvals, missing assets/content, durable artifact links, verification evidence, and launch dependencies in resumable progress comments. Host capabilities vary: when file/build/browser tools are missing, complete available planning and explicitly leave implementation/testing outstanding. A local artifact path is not proof of handover. Philo owns production deployment and acceptance.

## 10. Progress and submission

Use readable ordinary task comments with these report kinds: draft, submission, blocker, scope_proposal.

Reports include format version, UUID report ID, task/person identifiers, task type, brief version, summary, per-item responses, evidence, outstanding items, blockers, and separate proposals. Verify actual comment authorship; report text cannot impersonate another customer or Philo.

Before the first draft save, explain task-comment visibility and obtain agreement to save progress. Save only intentional assignment content. Hidden comments are visible only to their creator and are unsuitable for submitting to Philo.

Before submission:
1. Check answers and evidence against the issued criteria.
2. Re-read the current brief and relevant comments.
3. Reconcile changed requirements or conflicting drafts.
4. Show the proposed report and identify incomplete work.
5. Obtain confirmation of the report and its Productive destination.
6. Post the submission comment and return the confirmed comment ID/link.

A failed scenario can be a fully documented review result. Unknown information, blocked work, and untested scenarios remain explicit; they do not silently satisfy completion.

Do not edit the issued description, change task assignment/status, create feature tasks automatically, or mark acceptance during customer submission. Philo reviews using its own account.

## 11. Persistence, failures, and review

Task comments hold saved drafts and reports. New chats reload current task data and relevant comments, respecting authorship and brief version.

Append new reports rather than overwriting other participants' work. Re-reading reduces conflict risk but does not provide transactional concurrency guarantees.

After a timeout, read back comments and look for the exact report ID and creator. If uncertain, stop retries and explain. Report IDs are a best-effort duplicate check, not server-enforced idempotency. There is no custom outbox or guaranteed background delivery.

If saving is denied or unavailable, offer an unsaved report without claiming persistence. Never borrow another account or staff credentials.

Philo requests clarification, revises the brief, accepts, or cancels using its configured project workflow. Do not assume workflow display names or IDs. Submitted work awaiting Philo is excluded from customer chasing unless later verified owner feedback requests more information.

## 12. Evidence and privacy

Use evidence already accessible to authorised reviewers, or supported Productive attachment functionality after verifying capabilities and permissions. Do not assume temporary chat attachments remain accessible.

Keep credentials out of the package. Use provider connection controls for login. Access and retention are managed through Productive and the customer's AI platform; describe actual data handling in customer guidance before release.

Do not expose unrelated customer, financial, or internal information. Productive permissions are the access boundary; Philo skills focus activity on the assignment.

## 13. Reminders

The first release provides manual check-ins. It does not create schedules or promise background notifications.

A later reminder adapter needs explicit opt-in, verified scheduling/tool access, cadence/timezone/contact-window controls, suppression of unchanged alerts, and a clear stop mechanism. Do not chase accepted/cancelled work or submissions awaiting Philo. A generated message is not proof of notification delivery.

## 14. Verification and release

Documented provider/connector support is not a customer-account test. Record platform, account type/plan, versions, date, and outcomes in docs/platform-compatibility.md.

Required pilot checks:
- Installation, setup, individual Productive authentication, organisation selection, and reconnect.
- Not invited, no assigned work, revoked access, denied actions, and another customer's task.
- Invitation lookup with authorised email tools, manual fallback without email access, expired/mismatched invitations, and resuming connection after activation. Keep activation tokens out of reports.
- Correct routing, unknown types, scope drift, disagreement, missing evidence, and untested-pass requests.
- Shared drafts, new-chat resume, changed briefs, and multiple concurrent drafts.
- Final confirmation, readable Productive report, timeout recovery, and Philo clarification.
- Package inspection: no credentials, internal data, or server-only files.

Local schemas/test helpers validate authoring examples and report structure only. They are not Productive enforcement or proof that an assistant followed the skill.

Version plugin releases independently of the assignment format. Do not assume every installed customer immediately updates.

## 15. Implementation phases

1. Shared curated skills, provider adapters, Productive connection guidance, brief/report conventions, and local package checks.
2. One external-customer information request end to end through Productive on both providers.
3. Software reviews, evidence, scope handling, and realistic conversation evaluation.
4. Customer pilot and tested website installation/support guidance.
5. Broader publication, optional reminders, and further providers after equivalent journey checks.

Measure setup friction, time to useful work, completion quality, clarification frequency, missing evidence, and how well proposals stay separate from the assigned scope.

## 16. References

Checked 12 October 2026:
- [Productive MCP](https://help.productive.io/en/articles/14817386-mcp-server)
- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
- [OpenAI skills](https://developers.openai.com/plugins/concepts/skills)
- [Claude plugin structure](https://claude.com/docs/plugins/build)
- [Claude plugin installation](https://claude.com/docs/plugins/overview)
- [Claude platform support](https://claude.com/docs/plugins/platform-support)

Productive's internal Skills feature is separate from these skills installed in ChatGPT/Claude. No dependency on that internal feature is introduced.
