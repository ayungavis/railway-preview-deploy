import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  VariableCollectionUpsertMutation,
  VariableCollectionUpsertMutationVariables
} from '../../graphql/types'

export const variableCollectionUpsert = async ({
  input
}: VariableCollectionUpsertMutationVariables): Promise<VariableCollectionUpsertMutation> => {
  try {
    const result = await sdk.VariableCollectionUpsert({ input })
    return result
  } catch (error) {
    core.setFailed(
      `Failed to update the environment variables: ${(error as Error).message}`
    )
    throw error
  }
}
