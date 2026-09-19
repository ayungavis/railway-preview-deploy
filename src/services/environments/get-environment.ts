import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  GetEnvironmentQuery,
  GetEnvironmentQueryVariables
} from '../../graphql/types'

export type EnvironmentDetails = NonNullable<GetEnvironmentQuery['environment']>

export const getEnvironment = async (
  variables: GetEnvironmentQueryVariables
): Promise<EnvironmentDetails> => {
  try {
    const result = await sdk.GetEnvironment(variables)
    if (!result.environment) {
      throw new Error(`Environment not found: ${variables.id}`)
    }

    if (
      variables.projectId &&
      result.environment.projectId !== variables.projectId
    ) {
      throw new Error(`Environment not found in project: ${variables.id}`)
    }

    return result.environment
  } catch (error) {
    core.setFailed(`Failed to get environment: ${(error as Error).message}`)
    throw error
  }
}
