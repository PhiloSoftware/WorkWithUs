# Productive setup for the pilot

## Customer access

Invite the customer to Productive and configure their permission set and project/task sharing. They authenticate with their own account in ChatGPT or Claude. No Philo credentials are distributed in the plugin.

Productive documents individual MCP connections, AI features enabled, and the Ultimate plan as prerequisites. Confirm these for the pilot organisation. [Productive MCP](https://help.productive.io/en/articles/14817386-mcp-server).

Installation on the website starts guided setup. When account activation is needed, the setup skill helps find the Productive invitation through authorised email tools, or gives manual mailbox/spam search instructions when email access is unavailable or declined. The customer activates their account and approves the Productive connection, then setup rechecks their authenticated identity and continues to their first task. Missing, expired, wrong-recipient, or wrong-organisation invitations require resolution with Philo; finding an email is not successful authentication.

A connected account with no assignments should report that result. Do not infer missing membership solely from an empty search. Email access is optional, and activation links/tokens are not copied into task reports.

The planned website form captures email and company and shows provider installation buttons immediately. Philo's provisioning automation prepares client access, a private discovery project, and an issued information-request task. This website/provisioning automation is not implemented by the skills and still needs building and end-to-end verification. Ongoing task access uses the customer's own Productive connection.

## Issue a Philo task

Create a Productive task in the correct customer project and assign it to the intended customer. Place a clearly labelled **Philo assignment** JSON block in its description using one of:

- [Information request example](../templates/productive/information-request.json)
- [Software review example](../templates/productive/software-review.json)
- [Website creation example](../templates/productive/website-creation.json)

Replace the example ownerPersonId with the actual Philo reviewer ID and customise all content. Keep issueState draft until the brief is ready; change it to issued when assigning customer work. Use stable question/scenario IDs. Increment briefVersion and explain changes when revising an issued brief.

The website example explicitly commissions a marketing build or, if business data is needed, a requirements handoff. Narrow it to the intended deliverables before issuing. For a business build, Philo must issue scope, architecture, data boundaries, and permitted environment/actions; customer brand approval does not supply that authority. Website progress uses deliverable IDs and completed/in_progress/blocked/needs_clarification outcomes. Keep source in an accessible repository or archive and link it from intentional task comments.

The description is the initial explicit mapping. No custom field has been created or assumed. Productive's task_type and type_id fields are structural task classifications, not information_request/software_review. A future custom-field mapping must resolve actual field IDs/options and handle conflicts explicitly.

## Record progress and review

The customer's skill appends readable task comments with a report kind, UUID, task/person identifiers, brief version, and responses. Obtain agreement before the first shared draft; obtain separate final report confirmation before submission.

Normal comments are visible to those with appropriate task access. Hidden comments are only visible to their creator, so they must not be used for reports intended for Philo. Reviewers respond as the issued owner or an explicitly configured reviewer. They request clarification, revise the brief, or accept work using the project's actual workflow.

No automatic task-status transitions are configured by this add-on. A submission comment is not acceptance. Do not create a task for every defect or feature idea; triage the report first.

## Connection metadata verified

On 12 October 2026, read-only connector schema discovery confirmed:

- Tasks expose description, custom_fields, assignee, project, workflow_status, and visibility.
- The assignee filter can also match assigned to-dos; inspect the actual returned task assignee.
- Tasks can live directly in a project without a task list.
- Comments support body, is_hidden, creator, and task parent relationships; creation needs exactly one parent.
- Description/comment content accepts limited Markdown; headings and HTML are unsupported.

Only metadata was inspected using the staff connection. No customer task data was copied into the package and no Productive records or permissions were changed. Client read/comment permissions and the complete host journey remain pilot checks.
