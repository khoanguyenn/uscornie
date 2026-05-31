---
name: create-pr
description: >
  Guides the creation of Pull Requests (PRs) in the uscornie repository.
  Use when opening, formatting, or updating pull requests.
  Ensures PR titles and bodies comply with project standards (PR template, Conventional Commits).
compatibility: Requires GitHub CLI (gh)
allowed-tools: Bash(gh:*)
---

# Creating Pull Requests

Follow these instructions when creating or proposing Pull Requests in this repository.

## PR Title Format
PR titles must match the **Conventional Commits v1.0.0** specification, similar to commit headers:
`<type>(<scope>): <description>` (e.g., `feat(backend): add authentication middleware`)

Rules:
- Title must be in the imperative mood.
- Title must start with a lowercase letter.
- No trailing period.
- Limit to a maximum of 15 words.

## PR Body Template
Every Pull Request must use the standard template located at [.github/pull_request_template.md](file:///.github/pull_request_template.md):

```markdown
## Context

- **Closes**: #<issue_number> or #none

## What changed?

- <bullet point summarizing changes>
- <bullet point summarizing changes>
```

Rules for the body:
- **Context**: Reference any issues that are closed or resolved by this PR. Use `#none` if there is no corresponding issue.
- **What changed**: Provide clear, concise bullet points summarizing the changes. Keep bullet points brief and easy to scan.

## Standard Command to Create a PR
Use the GitHub CLI (`gh`) to open pull requests:

```bash
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body-file .github/pull_request_template.md \
  --draft
```

> [!NOTE]
> It is recommended to create PRs as **Drafts** (`--draft`) first, and mark them as ready for review once CI checks have run and passed.
