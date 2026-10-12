# Platform compatibility

Updated 12 October 2026 for the direct Productive architecture.

| Capability | ChatGPT | Claude | Project evidence |
| --- | --- | --- | --- |
| Package | Root Agent Plugins manifest | .claude-plugin/plugin.json | Built and locally validated |
| Workflow skills | Shared source | Same shared source | Package content/link tests |
| Connection | Existing Productive app, customer connects separately | Bundled Productive HTTP MCP endpoint | Package config tested; installation pending |
| Identity/access | Customer's Productive account | Customer's Productive account | Native tool metadata inspected; client journey pending |
| Setup | Onboarding skill plus starter prompt | Explicit setup skill/starter prompt | Skill files validated; host invocation pending |
| Persistence | Task comments | Task comments | Native comment schema inspected; no live write test |
| Reminders | Manual only | Manual only | Automatic scheduling not enabled |
| Website creation | Shared classification and website skill | Same shared skill | Packaged; actual file/runtime/browser access depends on host and remains untested |

## Documented routes

ChatGPT's Productive app is connected through Apps > Productive > Connect, followed by the customer's Productive login and organisation selection. Claude can use Productive's remote MCP connection. Each user connects individually. Productive documents AI enabled and Ultimate-plan access as prerequisites. [Productive MCP documentation](https://help.productive.io/en/articles/14817386-mcp-server).

The ChatGPT package deliberately contains no invented registered app ID or redundant remote MCP declaration. Work with Philo skills use the existing Productive app after the customer enables it. Confirm cross-app tool availability in the customer pilot. OpenAI's portable package and onboarding format are documented in [Package your plugin](https://developers.openai.com/plugins/build/plugins). Public publication remains a separate [submission process](https://developers.openai.com/plugins/deploy/submission); no public installation link has been created.

Claude's package includes .mcp.json with Productive's fixed HTTPS endpoint. The customer adds/connects the connector from the plugin's Connectors tab. ZIP upload is documented under Customize > Plugins > Add > Upload plugin. Claude Code can use `claude --plugin-dir ./dist/productive/claude/work-with-philo`. A CLI-only test does not prove the chat journey. [Claude plugin structure](https://claude.com/docs/plugins/build), [installation](https://claude.com/docs/plugins/overview), [surface support](https://claude.com/docs/plugins/platform-support).

## Verification record

- Alpha.3 local build and archive: passed, with 19 automated tests covering package contents, connection profiles, routing, skill resources, and local authoring/report completeness. These checks do not execute a customer website build.
- Productive read-only task/comment schema discovery: completed using the staff connection.
- The initial five shared skills passed the skill-creator frontmatter validator. The sixth skill, website creation with marketing and business references, also passed on 12 October 2026.
- Claude CLI native manifest validation: not run; CLI is not installed here.
- Fresh external customer accounts, permission denial/isolation, Productive writes, and provider installation: not tested yet.
- Conversation scenarios in evals/scenarios.json remain pending; automated package tests do not prove model behaviour.

For each pilot run record account plan, provider surface/version, plugin version, date, and observed result. Exercise missing invitations, empty lists, wrong organisations, denied writes, resumed drafts, revised briefs, uncertain submission results, and subsequent Philo feedback.
