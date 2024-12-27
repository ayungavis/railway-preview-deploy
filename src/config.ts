import * as core from '@actions/core'

export const RAILWAY_ENDPOINT = 'https://backboard.railway.app/graphql/v2'

// Action inputs
export const PROJECT_ID = core.getInput('project_id')
export const PROJECT_ENVIRONMENT_NAME = core.getInput('environment_name')
export const PROJECT_ENVIRONMENT_ID = core.getInput('environment_id')
export const PREVIEW_ENVIRONMENT_NAME = core.getInput(
  'preview_environment_name'
)
export const ENVIRONMENT_VARIABLES = core.getInput('environment_variables')
export const API_SERVICE_NAME = core.getInput('api_service_name')
export const IGNORE_SERVICE_REDEPLOY = core.getInput('ignore_service_redeploy')
export const BRANCH_NAME = core.getInput('branch_name')
export const REUSE_PREVIEW_ENVIRONMENT =
  core.getInput('reuse_preview_environment') || 'true'
export const IS_CLEANUP = core.getInput('cleanup') || 'false'
