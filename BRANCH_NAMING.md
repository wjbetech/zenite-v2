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

## Workflow

1. **Create feature branches from `staging`:**
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feat/your-feature-name
   ```

2. **Create PRs to `staging` first:**
   - Open PR: `feat/your-feature-name` → `staging`
   - Review, test on Vercel preview
   - Merge to staging

3. **Deploy to production:**
   - Open PR: `staging` → `master`
   - Resolve any conflicts
   - Merge to master (triggers production deployment)

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
