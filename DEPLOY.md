# Deployment

Currently all deployments are automated, however we must manually generate a changelog and escalate changes through the various stages. Before starting ensure you know what the next version of your app should be. 

If the update is a patch version ie `1.16.0 => 1.16.1` then you'll need to provide it to the yarn release-as command ie `yarn release-as 1.16.1`.

If the update is a standard minor version ie `1.15.0 => 1.16.0`, then the `yarn release` command will increment the version for you.


## Integration
- PR into integration


## Staging

Creating a new staging release accomplishes 2 things:

- Updates integration with the current changelog and release version
- Moves all recent changes to staging

### Part 1 - Cut release on integration

- Create a new branch based on integration: `consumer-release-1.16.0`
- Run `yarn release` for minor (ie. 1.16.0) or `yarn release-as 1.16.1` for patch (ie. 1.16.1)
- Commit changes and push.
- Create a PR to integration ie `chore(release): consumer 1.16.0`
- Merge PR into integration after approval

### Part 2 - Update staging with latest changes

- Create a new branch based on staging: `consumer-staging-release-1.16.0`
- `git merge integration`
- Commit changes and push
- Create a PR to staging ie `chore(release): consumer 1.16.0`
- Merge into staging after approval


## UAT

Deploy to UAT by creating a new branch based on UAT, merging in staging, and creating a PR.

- Create a new branch based on UAT: `consumer-uat-release-1.16.0`
- `git merge consumer-staging`
- Commit changes and push
- Create a PR to UAT ie `chore(release): consumer 1.16.0`
- Merge into UAT after approval

## Production

Deploy to production by creating a new branch based on current production, merging in UAT, and creating a PR.
We'll also update our production rollback branch. 

Only an Admin can approve this PR after sign-off from key stakeholders.

As engineers, it's our responsibility to generate the back-up, and create the PR to be approved.

### Part 1 - Create a rollback
- Create a new branch based on production-rollback: `consumer-production-rollback-release-1.16.0`
- `git merge consumer-production`
- Commit changes and push
- Create a PR to consumer-production-rollback ie `chore(release): backup consumer 1.15.0`

### Part 2 - Create a PR against production
- Create a new branch based on production: `consumer-production-release-1.16.0`
- `git merge consumer-uat`
- Commit changes and push
- Create a PR to consumer-production ie `chore(release): consumer 1.16.0`
- Admin/QA will approve/merge in final PR and changes are live!

## Hot Fix (any stage)

- Create a branch/PR against integration. All changes must hit integration before being added to any other branches.
- After changes have been merged into integration:
  - Create a new branch based on your current stage (ie staging/uat) with an incremented minor version ie `hotfix 1.16.1`
  - Cherry pick or insert your updates manually and push with a standard commit message "fix(consumer): spelling typo (SW2-000)"
  - Commit changes and push
  - Run `yarn release-as 1.16.1` to update the changelog with recent changes.
  - Commit changes and push
  - Create a PR to consumer-staging ie `fix(consumer): hotfix 1.16.1 spelling typo`

