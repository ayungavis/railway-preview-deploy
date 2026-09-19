import * as core from '@actions/core'
import { deploymentTriggerUpdate } from '../services/deployments/deployment-trigger-update'

type UpdateAllDeploymentTriggers = {
  deploymentTriggerIds: string[]
  branchName: string
}

export const updateAllDeploymentTriggers = async ({
  deploymentTriggerIds,
  branchName
}: UpdateAllDeploymentTriggers): Promise<void> => {
  try {
    const updatedPromises = deploymentTriggerIds.map(
      async id =>
        await deploymentTriggerUpdate({
          id,
          input: {
            branch: branchName
          }
        })
    )

    await Promise.all(updatedPromises)
    console.log('All deployment triggers updated')
  } catch (error) {
    core.setFailed(
      `Failed to update all deployment triggers: ${(error as Error).message}`
    )
    throw error
  }
}
