# ChatGPT and Productive

Use the customer's existing Productive app connection. In ChatGPT Apps, find Productive, choose Connect, and sign in using their own Productive account. Select the intended organisation during authorisation. There is no separate Work with Philo login.

This package does not declare a guessed registered app ID or create a second Productive connection. If the host cannot expose Productive tools to the skill, explain the limitation. Verify the person and organisation using the actual Productive tool.

If activation is needed, follow the setup skill's invitation lookup or manual email instructions, then resume connection. Philo provisions the account and project/task access. Installing the add-on does not create an account or grant access. An empty task list alone does not prove a missing invitation.

The package declares the setup skill. Fallback prompt: "Use Philo Software's AI add-on to get me connected and show what needs my attention."

In customer-facing explanations, call this product "Philo Software's AI add-on" and describe Productive as "Philo's project tracking software". Use the actual Productive app name when needed to identify the connection in the provider UI or confirm the service receiving account access; never hide who the customer is authorising.

Never request passwords, tokens, or staff credentials in chat. Automatic reminders are not enabled; offer manual check-ins.
