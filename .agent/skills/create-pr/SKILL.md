---
name: create-pr
description: >
  Guides the creation of Pull Requests (PRs) in the uscornie repository.
  Use when opening, formatting, or updating pull requests.
  Ensures PRs comply with the project standards defined in CONTRIBUTING.md.
compatibility: Requires GitHub CLI (gh) and Git
allowed-tools: Bash(gh pr create, gh pr checks, git checkout, git push, git add, git commit)
---

# Creating Pull Requests

Follow these instructions when creating or proposing Pull Requests in this repository.

## Single Source of Truth: CONTRIBUTING.md
You **MUST** read and follow the official guidelines in [CONTRIBUTING.md](/CONTRIBUTING.md) before writing code, committing changes, or opening a PR. Specifically:

1. **Changelog Generation**: If your changes introduce user-visible or structural edits, you must generate a changelog fragment using `changie new` **before** opening a PR (see [CONTRIBUTING.md Section 4](/CONTRIBUTING.md#4-versioning--release-pr-changie)).
2. **PR & Commit Format**: 
   - PR Title must match the Conventional Commits v1.0.0 header standard (see [CONTRIBUTING.md Section 2](/CONTRIBUTING.md#2-commit-standards-conventional)).
   - PR Body must fill out the template in [.github/pull_request_template.md](/.github/pull_request_template.md) (see [CONTRIBUTING.md Section 3](/CONTRIBUTING.md#3-pull-request-process)).

## Command to Create a PR
Use the GitHub CLI (`gh`) to open a pull request. Make sure you are on your feature branch:

```bash
# Verify changie unreleased file exists if changes are user-visible
ls -la .changie/unreleased/

# Create the pull request
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body-file .github/pull_request_template.md \
  --draft
```

> [!NOTE]
> It is recommended to create PRs as **Drafts** (`--draft`) first, and mark them as ready for review once CI checks have run and passed.
