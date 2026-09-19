import * as core from '@actions/core'
import {
  PREVIEW_ENVIRONMENT_NAME,
  PROJECT_ENVIRONMENT_ID,
  PROJECT_ENVIRONMENT_NAME,
  PROJECT_ID
} from '../config'
import {
  findPreviewEnvironment,
  resolveSourceEnvironment
} from '../helpers/environment-selection'
import { deleteEnvironment } from '../services/environments/delete-environment'
import { getAllEnvironments } from '../services/environments/get-environments'

/**
 * Function to clean up preview environments.
 * @param environmentName The name of the environment to delete.
 */
export const cleanup = async (): Promise<void> => {
  try {
    const environments = await getAllEnvironments({ projectId: PROJECT_ID })
    const sourceEnvironment = resolveSourceEnvironment(environments, {
      projectId: PROJECT_ID,
      environmentId: PROJECT_ENVIRONMENT_ID || undefined,
      environmentName: PROJECT_ENVIRONMENT_NAME || undefined
    })
    const selectedEnvironment = findPreviewEnvironment(
      environments,
      PREVIEW_ENVIRONMENT_NAME,
      sourceEnvironment
    )

    if (!selectedEnvironment) {
      core.info(
        `No environment found with the name: ${PREVIEW_ENVIRONMENT_NAME}`
      )
      return
    }

    core.info(
      `Deleting environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironment.id})`
    )
    await deleteEnvironment({ id: selectedEnvironment.id })
    core.info(`Environment ${PREVIEW_ENVIRONMENT_NAME} deleted successfully.`)
  } catch (error) {
    core.setFailed(`Cleanup failed: ${(error as Error).message}`)
  }
}
