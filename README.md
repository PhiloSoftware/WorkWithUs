# Work with Philo

Philo assigns a task in Productive. The customer's own ChatGPT or Claude uses a Philo-maintained skill to guide them through that task, preserve its scope, and return a useful report.

**Productive is the connection, identity, permissions, and work record.** This add-on does not require a separate Philo backend, customer login, or service credential.

## Current build

Version 0.1.0 contains six shared skills: setup, task selection/resume, information requests, software reviews, website creation, and manual check-ins.

- ChatGPT uses the customer's existing Productive app connection.
- Claude includes Productive's remote MCP endpoint and uses the customer's Productive authentication.
- Drafts, blockers, proposals, and confirmed submissions are ordinary task comments.
- Philo owns task issuing, scope changes, review decisions, and acceptance.
- Customers without Productive access are guided to obtain an invitation; an empty task list is handled separately.
- Website creation classifies marketing, business, or mixed needs. Marketing follows brand approval, sitemap/content approval, Nuxt implementation, quality review, and source handover. Business sites begin with data/workflow planning for Philo; backend work requires an issued scope and approved architecture.

Provider installation and customer permissions still need end-to-end verification. Local build and package tests do not establish these behaviours. No live Productive task or comment was created during this build.

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

Maintain workflows once in shared/. The builder copies shared references into every skill so each installed skill is self-contained. Skill-specific references are explicitly allowlisted in shared/plugin.json; unrelated files are never swept into a package. Edit source, not generated packages.

## Build

Node.js 22+ is required. The ZIP step uses PowerShell 7 and .NET to preserve hidden manifest folders.

```powershell
npm.cmd ci
npm.cmd run package
```

This validates, tests, builds, and archives both Productive packages:

- dist/productive/work-with-philo-chatgpt-0.1.0-productive.zip
- dist/productive/work-with-philo-claude-0.1.0-productive.zip

Upload only the provider ZIP or its work-with-philo directory. Never distribute the repository or the entire dist directory.

### GitHub Actions builds

The Build plugin packages workflow runs on pushes, pull requests, and manual workflow_dispatch runs. It installs locked dependencies, runs the same validation/tests/package command, and uploads separate version-labelled ChatGPT and Claude artifacts with 30-day retention. Open the completed run under Actions to download them. GitHub wraps each artifact in an archive; extract it and use the inner provider ZIP for plugin installation.

These are development build artifacts. Artifact downloads require a GitHub login and repository read access, even for public repositories. Customer downloads use GitHub Releases in this public repository.

### Publish customer downloads

The Publish plugin release workflow runs when a v* tag is pushed. It checks that the tag matches shared/plugin.json, package.json, and both lockfile version fields, then validates, tests, and packages both providers. It stages these fixed release-asset names:

- work-with-philo-chatgpt.zip
- work-with-philo-claude.zip
- SHA256SUMS.txt

The workflow uploads all assets to a draft, verifies that they are present, and publishes the completed release. Stable releases become latest; prereleases do not change the website's latest downloads. A failed build does not publish anything. A failed upload leaves a draft and preserves the previous latest release. Rerun a failed tag run or use the manual workflow with its existing tag to finish an unpublished draft. Published versions cannot be overwritten; use a new version and tag.

For each release:

1. Update shared/plugin.json, package.json, and the root/package versions in package-lock.json to the same version, for example 0.1.1.
2. Commit and push the changes to main.
3. Create and push the matching tag:

```powershell
git tag v0.1.1
git push origin v0.1.1
```

Wait for Publish plugin release to succeed. The website uses these permanent links:

- [Download for ChatGPT](https://github.com/PhiloSoftware/WorkWithUs/releases/latest/download/work-with-philo-chatgpt.zip)
- [Download for Claude](https://github.com/PhiloSoftware/WorkWithUs/releases/latest/download/work-with-philo-claude.zip)

GitHub redirects them to the latest stable release, so no website deployment or server-side ZIP replacement is needed for each add-on release. Existing releases remain available under their tags. These links deliver the latest download; they do not update a customer's installed copy. Customers using ZIP installation download the new package and replace their installed copy through their provider's plugin controls.

References: [artifact access and retention](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts), [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

Build one provider with `npm.cmd run build -- --provider claude`.
For an explicitly disconnected rehearsal build:

```powershell
npm.cmd run build -- --profile preview
pwsh -NoProfile -File scripts/package.ps1 -Profile preview
```

The old connected/custom-endpoint build profile is removed. Current builds need no PHILO_MCP_URL or Philo server. Use the current Productive packages above.

## First customer journey

Use: **Use Work with Philo to get me connected and show what needs my attention.**

Connect the customer's own Productive account, select the correct organisation, and find an assigned task containing an issued Philo brief. The task type selects the skill. Progress is saved with the customer's agreement; the final report is shown for confirmation before posting.

See [Productive setup](docs/productive-setup.md), [architecture](docs/architecture.md), and [platform compatibility](docs/platform-compatibility.md). [spec.md](spec.md) records the current product direction.
