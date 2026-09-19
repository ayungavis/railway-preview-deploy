import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import { GetDeploymentQuery } from '../../graphql/types'

export type DeploymentDetails = NonNullable<GetDeploymentQuery['deployment']>

export const getDeployment = async (id: string): Promise<DeploymentDetails> => {
  try {
    const result = await sdk.GetDeployment({ id })
    if (!result.deployment) {
      throw new Error(`Deployment not found: ${id}`)
    }

    return result.deployment
  } catch (error) {
    core.setFailed(
      `Failed to get deployment ${id}: ${(error as Error).message}`
    )
    throw error
  }
}
