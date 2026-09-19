import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  DeleteEnvironmentMutation,
  DeleteEnvironmentMutationVariables
} from '../../graphql/types'

export const deleteEnvironment = async ({
  id
}: DeleteEnvironmentMutationVariables): Promise<DeleteEnvironmentMutation> => {
  try {
    const result = await sdk.DeleteEnvironment({ id })
    if (!result.environmentDelete) {
      throw new Error(`Environment was not deleted (id: ${id})`)
    }

    return result
  } catch (error) {
    core.setFailed(
      `Failed to delete environment (id: ${id}): ${(error as Error).message}`
    )
    throw error
  }
}
