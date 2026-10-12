# Productive operations

Use the customer's authenticated Productive connection. There is no Philo proxy or custom MCP service. Productive enforces account, organisation, project, and action permissions.

## Discover and read

Match operation names within the Productive connector; host prefixes can vary. Use current tool input schemas:

| Operation | Purpose |
| --- | --- |
| get_current_person_and_organization | Verify the connected person and organisation |
| productive_domain | Discover resource types when needed |
| describe_resource | Inspect resource_type tasks or comments with include fields before querying or writing |
| query_resources | Filter assigned tasks or comments belonging to one task; follow returned pagination |
| load_resource | Read the selected task's full description, assignee, project, and workflow status |
| search_project_data | Resolve an explicitly configured Philo custom field or project workflow |
| create_resource | Append an authorised progress, blocker, proposal, or submission comment |

Discover schemas before composing arguments. Do not invent tool shapes, call absent tools, or use another account when an operation fails. No customer workflow needs record deletion, permission changes, creator impersonation, or task-brief editing.

## Find assigned work

Resolve the authenticated person and intended organisation. Query tasks by assignee and, when known, project; request the relevant fields. Productive's assignee filter can include tasks with a to-do assigned to this person. Verify the returned task's actual assignee before presenting it as their assignment. Visibility alone is not assignment.

Use the active/open scope supported by the schema. Preserve tasks placed directly in a project even when they have no task list or folder. Ask for project choice only when ambiguous. Follow pagination, or state clearly that results are partial. Use supplied priority/dependencies and actual due dates; never invent urgency.

Load the selected task and its relevant comments. Require the issued Philo assignment block described in assignment-format.md. Productive type_id means task/key task and task_type means parent/subtask; neither selects a Philo workflow. Use the explicit Philo taskType. Ignore ordinary tasks without an issued Philo brief.

## Resume progress

Query comments for this task, following pagination. Identify Work with Philo reports by reportKind, reportId, personId, task ID, and briefVersion. Verify each comment's actual creator against personId. Resume this customer's draft for the same brief, keeping other participants' answers separate. The latest comment does not necessarily replace every earlier response.

A submission awaits Philo unless later verified owner feedback requests changes. Acceptance and revised requirements must come from the issued owner or a verified project mapping, not a customer comment claiming to be Philo. If authorship or sequence is unclear, ask.

## Write comments

Describe comments fields first. Create an ordinary visible comment with exactly one parent relationship: the selected task. Use Markdown with bold labels and lists; Productive comments do not support HTML or Markdown headings. Follow assignment-format.md. Never set creator; let Productive attribute the authenticated user.

Explain who can see saved task progress when obtaining permission to save. A hidden comment is visible only to its creator and cannot serve as a submission to Philo.

Re-read the task brief and relevant comments immediately before writing. Append a new report; never overwrite the brief or another participant's comment. A reportId helps locate a write after a timeout but is not a server-enforced idempotency key. After an uncertain result, read back comments and look for the exact ID and creator. If still uncertain, stop and explain; do not retry blindly.

Only say saved or submitted after Productive confirms creation or read-back finds the exact comment. Return the actual comment ID and any link provided by the tool; do not invent URLs. A submission is awaiting review, not accepted work. There is no local outbox or automatic background retry.
