import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  ServiceInstanceUpdateInput,
  ServiceInstanceUpdateMutation,
  ServiceInstanceUpdateMutationVariables
} from '../../graphql/types'

export const updateServiceInstanceSource = async ({
  environmentId,
  serviceId,
  image
}: {
  environmentId: string
  serviceId: string
  image: string
}): Promise<ServiceInstanceUpdateMutation> => {
  const input: ServiceInstanceUpdateInput = {
    source: { image }
  }

  const variables: ServiceInstanceUpdateMutationVariables = {
    environmentId,
    serviceId,
    input
  }

  try {
    const result = await sdk.ServiceInstanceUpdate(variables)
    if (!result.serviceInstanceUpdate) {
      throw new Error(
        `Railway rejected the image update for service ${serviceId}`
      )
    }

    return result
  } catch (error) {
    core.setFailed(
      `Failed to update service ${serviceId} image: ${(error as Error).message}`
    )
    throw error
  }
}
