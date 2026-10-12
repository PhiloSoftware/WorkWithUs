# Architecture

## Responsibilities

Customer's ChatGPT or Claude + Work with Philo skills -> customer's Productive connection -> Productive tasks and comments.

Productive authenticates each customer and enforces permissions. Philo configures customer accounts, project sharing, task visibility, and permitted actions there. The add-on supplies the curated process and provider packaging. There is no separate Philo identity store, integration service, database, model API, or delivery queue.

ChatGPT reuses Productive's native app. The Claude package includes Productive's fixed remote MCP endpoint. Both run the same shared task skills.

## Issuing and completing tasks

Philo issues a task containing explicit workflow metadata in its description. The task's actual assignee and project determine its working context. The initial brief format lives in contracts/v0.1.0/assignment.schema.json, with examples in templates/productive/. A verified custom-field mapping may be added later.

The assistant loads current task data and comments, routes on the Philo taskType, and guides the customer through the items. With permission, it appends progress comments. Blockers and new ideas use separate report kinds. A confirmed final report is a submission comment; Philo reviews it and changes workflow state if appropriate.

The report schema and checkReportAgainstAssignment helper are local authoring/test aids. They are not Productive API contracts or validators running inside customer chats. Productive does not enforce Philo's JSON convention.

## Editing and recovery

Skills re-read the current brief and comments before writes. A revised version or changed content requires reconciliation. Append-only report conventions preserve prior drafts; the skills do not overwrite task descriptions or other comments.

A report UUID and read-back help identify a timed-out write. They do not provide atomic deduplication, locking, or guaranteed delivery. If the result remains uncertain, the assistant stops retries and reports that uncertainty. If offline or denied access, it can provide an unsaved report for the customer to retain.

## Extension points

| Change | Source |
| --- | --- |
| Improve customer guidance | shared/skills/ and shared/references/ |
| Add a task type | Registry, shared skill, authoring/report schemas, tests, conversation evaluations |
| Add another provider using an existing format | New provider adapter and instructions |
| Add a package format | Builder renderer and packaging tests |
| Change Productive field mapping | Shared Productive guidance and verified organisation configuration |
| Add reminders later | Provider-specific implementation after testing scheduling and notifications |

The archive helper recognises the two initial provider manifest layouts. Extend it when adding another format. Plugin releases and assignment format versions are independent.

## Next pilot

1. Invite a test customer in Productive and configure project/task permissions.
2. Create one task using an example brief, replacing example owner and content.
3. Install each provider package and connect as that customer.
4. Verify task discovery, mode selection, saved progress, new-chat resumption, final confirmation, and a readable comment submission.
5. Verify no-access handling, denial of disallowed actions, another customer's task, and Philo's request for clarification.

A staff connection's metadata is not a substitute for the customer pilot. The website should link only to a tested installation route.
