# Branch Naming Conventions

This project enforces branch naming conventions through GitHub Actions (`.github/workflows/branch-name-enforce.yml`).

## Allowed Branch Patterns

### Protected Branches
- `main` - Main production branch (not currently used)
- `master` - Production branch (protected, requires PR)
- `staging` - Staging/preview branch (protected, requires PR)

### Feature Branches
- `feature/*` - New features (e.g., `feature/user-auth`)
- `feat/*` - Short form for features (e.g., `feat/owner-access-controls`)

### Fix Branches
- `fix/*` - Bug fixes (e.g., `fix/login-redirect`)
- `bugfix/*` - Alternative for bug fixes (e.g., `bugfix/task-duplicate`)
- `hotfix/*` - Urgent production fixes (e.g., `hotfix/security-patch`)

### Other Branches
- `release/*` - Release preparation (e.g., `release/v1.2.0`)
- `chore/*` - Maintenance tasks (e.g., `chore/update-deps`)
- `refactor/*` - Code refactoring (e.g., `refactor/api-structure`)
- `docs/*` - Documentation updates (e.g., `docs/setup-guide`)
- `test/*` - Test improvements (e.g., `test/api-integration`)
- `merge/*` - Temporary merge resolution branches (e.g., `merge/staging-to-master-20251011`)

## Workflow (new)

The canonical development workflow for this repository is:

1. Developers branch from `main` for feature work.
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

2. Create PRs from your feature branch into `main` (optional) or directly into `staging` if you want a preview deploy.

3. When `main` is ready for integration testing / a preview deploy, open a PR: `main` → `staging`.
   - Staging runs preview builds on Vercel and integration checks.
   - Test the staging preview and fix issues on feature branches, then merge back into `main` and re-open `main` → `staging` if needed.

4. After staging verification, open a PR: `staging` → `master` to deploy to production.
   - Resolve any conflicts and merge to `master` (production deploys automatically).

Notes:
- `main` is the primary development branch and the source of truth for local development.
- `staging` is for integration testing and preview deployments.
- `master` is the production branch and should only be updated via PR from `staging`.

## Protected Branch Policies

- **`master`**: Cannot push directly (enforced by `.githooks/pre-push`). Use PRs only.
- **`staging`**: Should use PRs for team collaboration.

To override the master push protection (emergency only):
```bash
ALLOW_PUSH_MASTER=1 git push origin master
```

## Examples

✅ **Good branch names:**
- `feat/owner-access-controls`
- `feature/task-templates`
- `fix/timezone-bug`
- `hotfix/security-issue`
- `chore/update-dependencies`
- `docs/api-reference`
- `merge/staging-to-master-20251011`

❌ **Bad branch names:**
- `new-feature` (no prefix)
- `johns-changes` (unclear purpose)
- `temp` (not descriptive)
- `wip` (not descriptive)
