# Work with Philo

Philo assigns a task in Productive. The customer's own ChatGPT or Claude uses a Philo-maintained skill to guide them through that task, preserve its scope, and return a useful report.

**Productive is the connection, identity, permissions, and work record.** This add-on does not require a separate Philo backend, customer login, or service credential.

## Current build

Version 0.1.0-alpha.2 contains five shared skills: setup, task selection/resume, information requests, software reviews, and manual check-ins.

- ChatGPT uses the customer's existing Productive app connection.
- Claude includes Productive's remote MCP endpoint and uses the customer's Productive authentication.
- Drafts, blockers, proposals, and confirmed submissions are ordinary task comments.
- Philo owns task issuing, scope changes, review decisions, and acceptance.
- Customers without Productive access are guided to obtain an invitation; an empty task list is handled separately.

The provider installation and customer-permission journeys still need pilot testing. No live Productive task or comment was created during this build.

## Source layout

```text
shared/
  plugin.json                 # Plugin identity, release version, skill allowlist
  productive.json             # Productive endpoint; no credentials
  task-types.json              # Explicit Philo type -> skill mapping
  skills/                     # Canonical curated workflows
  references/                 # Shared scope, Productive, and reporting guidance
providers/
  chatgpt/                    # Native app connection instructions + manifest adapter
  claude/                     # Productive MCP connection + manifest adapter
contracts/v0.1.0/             # Local assignment/report authoring schemas, not an API
templates/productive/         # Example briefs for Philo task authors
scripts/                     # Package builder and local validators
tests/                       # Package and authoring validation
evals/                       # Pending real-conversation scenarios
docs/                        # Setup, architecture, compatibility evidence
dist/                        # Ignored generated packages and ZIPs
```

Maintain workflows once in shared/. The builder copies shared references into every skill so each installed skill is self-contained. Edit source, not generated packages.

## Build

Node.js 22+ is required. The ZIP step uses PowerShell 7 and .NET to preserve hidden manifest folders.

```powershell
npm.cmd ci
npm.cmd run package
```

This validates, tests, builds, and archives both Productive packages:

- dist/productive/work-with-philo-chatgpt-0.1.0-alpha.2-productive.zip
- dist/productive/work-with-philo-claude-0.1.0-alpha.2-productive.zip

Upload only the provider ZIP or its work-with-philo directory. Never distribute the repository or the entire dist directory.

Build one provider with `npm.cmd run build -- --provider claude`.
For an explicitly disconnected rehearsal build:

```powershell
npm.cmd run build -- --profile preview
pwsh -NoProfile -File scripts/package.ps1 -Profile preview
```

The old connected/custom-endpoint build profile is removed. Current builds need no PHILO_MCP_URL or Philo server. Old alpha.1 ZIPs in dist/preview are obsolete; use the alpha.2 Productive packages above.

## First customer journey

Use: **Use Work with Philo to get me connected and show what needs my attention.**

Connect the customer's own Productive account, select the correct organisation, and find an assigned task containing an issued Philo brief. The task type selects the skill. Progress is saved with the customer's agreement; the final report is shown for confirmation before posting.

See [Productive setup](docs/productive-setup.md), [architecture](docs/architecture.md), and [platform compatibility](docs/platform-compatibility.md). [spec.md](spec.md) records the current product direction.
