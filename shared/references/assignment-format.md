# Philo assignment and report format 1

These are Philo conventions inside Productive, not Productive API fields. Productive does not automatically validate this format.

## Issued brief

Philo places one labelled Philo assignment JSON block in the task description. The repository's assignment.schema.json defines it:

- formatVersion: 1
- taskType: information_request or software_review
- briefVersion: positive integer, incremented by Philo when requirements change
- issueState: draft, issued, or withdrawn; only issued enters guided work
- ownerPersonId: Productive person responsible for issuing and reviewing it
- objective, includedScope, excludedScope, completionCriteria
- items: stable IDs, prompts, and required flags
- Software reviews also supply testContext (environment, softwareVersion, role, permittedActions) and expectedBehaviour for every scenario.

Use the actual Productive task ID, assignee, project, and due date. Never issue or alter the brief as a customer workflow. Missing required metadata needs Philo setup.

A verified custom-field mapping may later provide these values. Never guess field IDs or substitute Productive's built-in type_id/task_type. Conflicting field and description values require Philo clarification.

## Comment format

Use bold labels and lists, not Markdown headings. Every saved report contains:

**Work with Philo**
- Format version: 1
- Report kind: draft | submission | blocker | scope_proposal
- Report ID: a fresh UUID for a new report, retained for uncertain-write checks
- Task ID: the selected task
- Person ID: the authenticated person; actual comment creator must match
- Task type: the explicit Philo taskType
- Brief version: the issued version being answered
- Summary: purpose and limitations

For drafts/submissions include item ID, outcome, answer or observation, provenance (customer_statement, ai_deduction, tool_observation), customer confirmation, and evidence references per response. Software failures include reproduction steps, expected/actual behaviour, and impact in their response text.

List outstanding item IDs, blockers, and separate proposals. Submissions include customer confirmation and completeness: complete or incomplete. Blocker/proposal reports preserve the explanation without changing the brief or completing items.

The repository's report.schema.json is a local validation aid for structured drafts before rendering readable comments. Customers need not paste JSON. The installed skills review answers themselves; no server validator, executable validator, outbox, or guaranteed deduplication is bundled.
