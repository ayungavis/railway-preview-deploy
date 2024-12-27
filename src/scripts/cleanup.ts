import * as core from '@actions/core'
import { PREVIEW_ENVIRONMENT_NAME, PROJECT_ID } from '../config'
import { deleteEnvironment } from '../services/environments/delete-environment'
import { getEnvironments } from '../services/environments/get-environments'

/**
 * Function to clean up preview environments.
 * @param environmentName The name of the environment to delete.
 */
export const cleanup = async (): Promise<void> => {
  try {
    const { environments } = await getEnvironments({ projectId: PROJECT_ID })

    const selectedEnvironments = environments.edges.filter(
      edge => edge.node.name === PREVIEW_ENVIRONMENT_NAME
    )

    if (selectedEnvironments.length >= 1) {
      const environmentId = selectedEnvironments[0].node.id
      core.info(
        `Deleting environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${environmentId})`
      )
      await deleteEnvironment({ id: environmentId })
      core.info(`Environment ${PREVIEW_ENVIRONMENT_NAME} deleted successfully.`)
    } else {
      core.info(
        `No environment found with the name: ${PREVIEW_ENVIRONMENT_NAME}`
      )
    }
  } catch (error) {
    core.setFailed(`Cleanup failed: ${(error as Error).message}`)
  }
}
