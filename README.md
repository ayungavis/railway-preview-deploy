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

| Name                        | Description                                                                                                                     | Required | Default |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `railway_api_token`         | The Railway API token.                                                                                                          | Yes      |         |
| `project_id`                | The Railway project ID. You can find it in the Railway dashboard under **Settings > General**.                                  | Yes      |         |
| `environment_name`          | The name of the environment that serves as the base for the preview deployment.                                                 | Yes      |         |
| `environment_id`            | The environment ID that serves as the base for the preview deployment. If provided, `environment_name` will be ignored.         | No       |         |
| `preview_environment_name`  | The name for the new preview environment. Use PR-specific naming, e.g., `pr-<PR_NUMBER>-<SHORT_COMMIT_HASH>`.                   | Yes      |         |
| `environment_variables`     | Environment variables to be set for the preview deployment, provided as a JSON object (e.g., `{"KEY": "value"}`).               | No       |         |
| `api_service_name`          | The name of the API service for the PR environment, used to identify the deployed domain.                                       | No       |         |
| `ignore_service_redeploy`   | A list of services to ignore when redeploying the PR environment. Useful for services that don't need redeployment on every PR. | No       |         |
| `branch_name`               | The branch name of the pull request used for the preview deployment.                                                            | Yes      |         |
| `reuse_preview_environment` | Whether to reuse an existing preview environment if it has already been created.                                                | No       | `true`  |
| `cleanup`                   | Whether to clean up the preview environment after the PR is closed.                                                             | No       | `false` |

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
        uses: ayungavis/railway-preview-deploy@v1.0.1
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: 'staging'
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          environment_variables:
            '{"DATABASE_URL": "postgres://user:pass@host/db"}'
          branch_name: ${{ github.head_ref }}
          cleanup: 'true'
```

**Inputs Breakdown:**

- `railway_api_token`: The token to authenticate your Railway API requests.
- `project_id`: The ID of your Railway project.
- `environment_name`: The base environment that the preview deployment will be
  derived from (e.g., staging).
- `preview_environment_name`: A custom name for the preview environment, which
  you can dynamically set using the PR number and commit hash.
- `environment_variables`: Optional environment variables you can set, provided
  in JSON format.
- `branch_name`: The branch from the pull request.
- `cleanup`: Whether to clean up the preview environment after the PR is closed.

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
        uses: ayungavis/railway-preview-deploy@v1.0.1
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: 'staging'
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          environment_variables: |
            {
              "DATABASE_URL": "postgres://username:password@hostname/db"
            }
          branch_name: ${{ github.head_ref }}

      - name: Post deployment info
        run:
          echo "Preview deployed at ${{ steps.deploy.outputs.service_domain }}"

      - name: Post or update deployment comment
        if: ${{ steps.test-action.outputs.service_domain != '' }}
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

              - \`web\` deployed at [${{ steps.test-action.outputs.service_domain }}](https://${{ steps.test-action.outputs.service_domain }})

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
        uses: ayungavis/railway-preview-deploy@v1.0.1
        with:
          railway_api_token: ${{ secrets.RAILWAY_API_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}
          environment_name: production
          preview_environment_name: 'pr-${{ github.event.pull_request.number }}'
          branch_name: ${{ github.head_ref }}
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
