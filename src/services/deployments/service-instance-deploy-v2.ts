import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  ServiceInstanceDeployV2Mutation,
  ServiceInstanceDeployV2MutationVariables
} from '../../graphql/types'

export const serviceInstanceDeployV2 = async ({
  commitSha,
  environmentId,
  serviceId
}: ServiceInstanceDeployV2MutationVariables): Promise<string> => {
  try {
    const variables: ServiceInstanceDeployV2MutationVariables = {
      environmentId,
      serviceId
    }

    if (commitSha) {
      variables.commitSha = commitSha
    }

    const result: ServiceInstanceDeployV2Mutation =
      await sdk.ServiceInstanceDeployV2(variables)
    const deploymentId = result.serviceInstanceDeployV2

    if (!deploymentId) {
      throw new Error(
        `Railway did not return a deployment ID for service ${serviceId}`
      )
    }

    return deploymentId
  } catch (error) {
    core.setFailed(
      `Failed to deploy service ${serviceId}: ${(error as Error).message}`
    )
    throw error
  }
}
