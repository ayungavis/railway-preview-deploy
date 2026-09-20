import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  GetServiceInstanceQuery,
  GetServiceInstanceQueryVariables
} from '../../graphql/types'

export type ServiceInstanceDetails = NonNullable<
  GetServiceInstanceQuery['serviceInstance']
>

export const getServiceInstance = async (
  variables: GetServiceInstanceQueryVariables
): Promise<ServiceInstanceDetails> => {
  try {
    const result = await sdk.GetServiceInstance(variables)
    if (!result.serviceInstance) {
      throw new Error(
        `Service instance not found: ${variables.serviceId} in ${variables.environmentId}`
      )
    }

    return result.serviceInstance
  } catch (error) {
    core.setFailed(
      `Failed to get service instance: ${(error as Error).message}`
    )
    throw error
  }
}
