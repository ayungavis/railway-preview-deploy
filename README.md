# Railway Preview Deploy Action

<!-- prettier-ignore -->
[![Lint Codebase](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/linter.yml/badge.svg)](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/linter.yml) [![CI](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/ci.yml/badge.svg)](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/ci.yml) [![Check dist/](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/check-dist.yml/badge.svg)](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/check-dist.yml) [![CodeQL](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ayungavis/railway-preview-deploy/actions/workflows/codeql-analysis.yml) [![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

![preview-deploy-example](assets/preview-deployment-example.png)

This GitHub Action automates the deployment of a preview environment for your
Railway project whenever a pull request is opened in your repository. It works
similarly to Vercel preview deployments. This allows you to easily review
changes in a live environment before merging.

## Features

- Deploys a new preview environment on every pull request.
- Supports custom environment variables for each deployment.
- Optionally reuses an existing preview environment for subsequent PRs.
- Optionally cleans up the environment when the PR is closed.
- Provides the deployed environment’s domain as an output for easy reference.

## Inputs

| Name                         | Description                                                                                                       | Required | Default  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- | -------- |
| `railway_api_token`          | The Railway API token.                                                                                            | Yes      |          |
| `project_id`                 | The Railway project ID. You can find it in the Railway dashboard under **Settings > General**.                    | Yes      |          |
| `environment_name`           | The name of the source environment. Provide this or `environment_id`; `environment_id` takes precedence.          | No       |          |
| `environment_id`             | The ID of the source environment. If provided, `environment_name` is ignored.                                     | No       |          |
| `preview_environment_name`   | The name for the new preview environment. Use PR-specific naming, e.g., `pr-<PR_NUMBER>-<SHORT_COMMIT_HASH>`.     | Yes      |          |
| `environment_variables`      | Environment variables to be set for the preview deployment, provided as a JSON object (e.g., `{"KEY": "value"}`). | No       |          |
| `api_service_name`           | The name of the API service for the PR environment, used to identify the deployed domain.                         | No       |          |
| `ignore_service_redeploy`    | A list of services to exclude from the explicit preview deployment.                                               | No       |          |
| `deployment_mode`            | Deployment source: `commit`, `image`, or `auto`.                                                                  | No       | `commit` |
| `image_ref`                  | Full Docker image reference, including registry, name, and tag.                                                   | No       |          |
| `commit_sha`                 | The commit SHA to deploy for the preview environment. Required in commit mode.                                    | No       |          |
| `branch_name`                | The pull request branch name. Required only when `update_deployment_triggers` is enabled.                         | No       |          |
| `update_deployment_triggers` | Whether to update Railway deployment triggers to `branch_name`.                                                   | No       | `false`  |
| `reuse_preview_environment`  | Whether to reuse an existing preview environment if it has already been created.                                  | No       | `true`   |
| `cleanup`                    | Whether to clean up the preview environment after the PR is closed.                                               | No       | `false`  |

## Outputs

| Name             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `service_domain` | The domain of the service that was deployed in the PR environment. |

## Usage

Here's an example of how you can use this action in your workflow file:

```yaml
name: Deploy Preview Environment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Railway Preview Deploy
        uses: ayungavis/railway-preview-deploy@v1.1.0
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: 'staging'
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          environment_variables:
            '{"DATABASE_URL": "postgres://user:pass@host/db"}'
          commit_sha: ${{ github.event.pull_request.head.sha }}
          cleanup: 'true'
```

**Inputs Breakdown:**

- `railway_api_token`: The token to authenticate your Railway API requests.
- `project_id`: The ID of your Railway project.
- `environment_name`: The source environment name that the preview deployment
  will be derived from (e.g., staging). Provide this or `environment_id`.
- `environment_id`: The source environment ID. When provided, it takes
  precedence over `environment_name`.
- `preview_environment_name`: A custom name for the preview environment, which
  you can dynamically set using the PR number and commit hash.
- `environment_variables`: Optional environment variables you can set, provided
  in JSON format.
- `deployment_mode`: Use `commit` for repository services, `image` for Docker
  image services, or `auto` to select from the Railway service source. Defaults
  to `commit`.
- `image_ref`: Full Docker image reference supplied by the workflow after it
  builds and pushes the image. The action does not build or push images.
- `commit_sha`: The exact pull request commit to deploy. Required in commit
  mode.

Deployment modes:

- `commit`: requires a repository-backed service and `commit_sha`.
- `image`: requires an image-backed service and `image_ref`; do not enable
  `update_deployment_triggers`.
- `auto`: uses `image_ref` for image-backed services and `commit_sha` for
  repository-backed services.

- `branch_name`: The pull request branch. Required only when trigger updates are
  enabled.
- `update_deployment_triggers`: Whether to update Railway branch triggers.
  Defaults to false.
- `cleanup`: Whether to clean up the preview environment after the PR is closed.

Reuse mode synchronizes variables and deploys the requested source. Image mode
expects a full `image_ref`; the workflow must build and push the image first.
The action sets `service_domain` only after Railway reports a successful
deployment. `update_deployment_triggers` is disabled by default; enable it only
when the workflow needs Railway branch triggers updated. This addresses #25.
Railway volumes and custom domains are not managed automatically.

### GHCR image integration

The action does not build or push Docker images. Build and publish the image in
your workflow, then pass the full reference with `deployment_mode: image` and
`image_ref`. Use a traceable tag containing the PR or test identifier and commit
SHA, for example `ghcr.io/org/app:pr-40-a1b2c3d`.

The manual GHCR integration workflow in this repository uses `GITHUB_TOKEN` with
`packages: write` only for the image-publishing job. That token is not available
to Railway. Private GHCR images require Railway-side registry pull credentials;
use a public test image otherwise. Do not run image-publishing workflows from
fork-controlled or untrusted code.

## Example Workflow

The following example workflow deploys a preview environment on Railway for each
pull request:

```yaml
name: Railway Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

permissions:
  contents: read
  pull-requests: write
  issues: write

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.action != 'closed' }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Deploy to Railway
        id: deploy
        uses: ayungavis/railway-preview-deploy@v1.1.0
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: 'staging'
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          environment_variables: |
            {
              "DATABASE_URL": "postgres://username:password@hostname/db"
            }
          commit_sha: ${{ github.event.pull_request.head.sha }}

      - name: Post deployment info
        run:
          echo "Preview deployed at ${{ steps.deploy.outputs.service_domain }}"

      - name: Post or update deployment comment
        if: ${{ steps.deploy.outputs.service_domain != '' }}
        uses: actions/github-script@v7
        with:
          script: |
            const marker = '<!-- preview-comment -->'; // Unique marker to identify the comment
            const { data: commits } = await github.rest.pulls.listCommits({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              per_page: 100 
            });
            const latestCommit = commits[commits.length - 1];
            const latestCommitSha = latestCommit.sha.substring(0, 7);
            const latestCommitAuthor = latestCommit.commit.author.name;


            const { data: comments } = await github.rest.issues.listComments({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo
            });

            const body = `
              ${marker}  <!-- This marker helps identify the comment for future updates -->
              🚀 **Deployment success!**

              - \`web\` deployed at [${{ steps.deploy.outputs.service_domain }}](https://${{ steps.deploy.outputs.service_domain }})

              ---

              *commit: ${latestCommitSha}*  
              *author: ${latestCommitAuthor}* 
            `;

            const existingComment = comments.find(comment => comment.body.includes(marker));

            if (existingComment) {
              await github.rest.issues.updateComment({
                comment_id: existingComment.id,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
              core.info(`Updated comment ID: ${existingComment.id}`);
            } else {
              await github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
              core.info('Created a new comment');
            }

  cleanup:
    runs-on: ubuntu-latest
    if:
      ${{ github.event.pull_request.merged == true || github.event.action ==
      'closed' }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Cleanup Railway Environment
        uses: ayungavis/railway-preview-deploy@v1.1.0
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: production
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          cleanup: 'true'
```

## License

This action is licensed under the MIT License.

This readme provides a clear description of the action, how to use it, and
example workflow configurations to help users quickly set up and start using
your GitHub Action.

---

<p style="font-size: 12px; color: #b3b3b3; font-style: italic;">
This PR is inspired by
<a href="https://github.com/Faolain/railway-pr-deploy" target="__blank">railway-pr-deploy</a> but with some
improvements and convert it to TypeScript.
</p>
