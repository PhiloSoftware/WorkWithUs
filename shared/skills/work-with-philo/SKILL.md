---
name: work-with-philo
description: Find, select, or resume a task assigned by Philo in Productive. Use for what does Philo need from me, continue my Philo task, or help with a Philo assignment.
---

Read [the working agreement](references/working-agreement.md), [Productive operations](references/tools.md), [assignment format](references/assignment-format.md), and [provider guidance](references/provider.md).

Resolve the authenticated Productive person and organisation. Query assigned tasks or load the requested task, verifying its actual assignee and issued brief. Read saved comments and owner feedback. A supplied task link grants no access. Use [setup](../setup/SKILL.md) when disconnected.

Route on the explicit Philo taskType using [the registry](references/task-types.json):

- information_request: load [information-request](../information-request/SKILL.md).
- software_review: load [software-review](../software-review/SKILL.md).
- website_creation: load [website-creation](../website-creation/SKILL.md).

Read the selected skill before working. Do not infer the mode from a title, built-in Productive task_type/type_id, or customer preference. Missing, contradictory, or unsupported metadata needs Philo clarification.

Explain the objective and next outstanding item. Resume this customer's progress for the current brief. If a submission exists, check later owner feedback instead of automatically starting again. Philo owns acceptance and scope revisions.
