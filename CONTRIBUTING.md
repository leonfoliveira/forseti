# Contributing Guidelines

Thank you for taking the time to contribute! This document outlines the process and requirements for contributing to this repository.

---

## Repository Overview

This repository is a monorepo containing **three distinct applications**. Please ensure your changes are localized to the appropriate application directory unless you are updating shared tooling or configuration.

---

## Issues & Feature Requests

We welcome all community contributions, including new features and bug reports!

- **Creating Issues:** Before starting work, check existing issues or create a new one for any bug fix or feature request.
- **Scope:** Clearly describe the problem, proposed solution, and affected application(s).

---

## Pull Request Guidelines

All changes must be submitted via Pull Requests (PRs). **Direct pushes to default branches are disabled.**

### 1. Small & Focused Scope
- **Keep PRs small:** Smaller PRs are easier to review and get merged much faster.
- **Issue Association:** Every PR **must be linked** to an open issue (e.g., using `Closes #123` or `Fixes #123` in the description).

### 2. Local Testing (Mandatory)
Before opening or updating a PR, you **must run regression tests locally** on your machine and confirm that all tests pass.

## CI Automation & Testing Requirements

Each application in this repository has its own automated GitHub Actions workflow.

- Linters & Automated Tests: Automated workflows run linters and tests automatically when a PR is opened or updated.

- Code Coverage: All PRs must maintain or exceed a minimum code coverage threshold of 90%.

- Regression Tests on PR:

  - Regression tests in CI do not run automatically.

  - A Code Owner will manually trigger the regression test workflow on your PR.

  - The PR cannot be merged until these regression tests pass successfully.

## How to Submit a Contribution

1. Fork/Branch: Create a branch from main using a descriptive name.

2. Develop & Test: Implement your changes and verify that:

  - Your code passes all local regression tests.

  - You have added unit tests for new behavior.

  - Code coverage remains at or above 90%.

3. Open PR: Submit your PR against the main branch, link the relevant issue, and fill out the PR description template.

4. Review & Merge: Address review feedback if requested. Once approved and CI regression tests are triggered and pass, a Code Owner will merge your PR.

## Need Help?

If you have questions, encounter ambiguities, or need guidance during development, please reach out directly to one of the Code Owners.
