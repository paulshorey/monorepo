# Legacy deployment retirement

Repository retirement is complete: all old apps moved to `archive/apps`,
all previous libraries/scripts/plans preserved, active workspace paths include only
new packages, provider config filenames are disabled, the legacy database workflow
is archived, and old root startup/secrets-hydration shortcuts are removed.

**Provider-side shutdown is not verified.** A source move does not stop an existing
container, deployment, cron or webhook. The locally authenticated Vercel account
`webartspaces` returned no projects in its current `webarts` scope. No Railway CLI
was available. No cloud service, database or credential was deleted or modified.

Outstanding: identify the account/project for any deployed write-node,
tradingview-node, view-next and log-next services; stop their deployments and
scheduled triggers, disable automatic deploys, and remove TradingView/Databento
upstream feeds that still target them. Retain databases/data for now. Record provider
IDs and final stopped status here once those resources are identified.
