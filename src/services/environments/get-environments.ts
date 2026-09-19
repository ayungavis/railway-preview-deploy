import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import {
  GetEnvironmentsQuery,
  GetEnvironmentsQueryVariables
} from '../../graphql/types'

const ENVIRONMENTS_PAGE_SIZE = 100

type EnvironmentSummary =
  GetEnvironmentsQuery['environments']['edges'][number]['node']

export const getEnvironments = async (
  variables: GetEnvironmentsQueryVariables
): Promise<GetEnvironmentsQuery> => {
  try {
    const result = await sdk.GetEnvironments(variables)
    return result
  } catch (error) {
    core.setFailed(`Failed to get environments: ${(error as Error).message}`)
    throw error
  }
}

export const getAllEnvironments = async ({
  projectId
}: Pick<GetEnvironmentsQueryVariables, 'projectId'>): Promise<
  EnvironmentSummary[]
> => {
  const environments: EnvironmentSummary[] = []
  let after: string | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const result = await getEnvironments({
      projectId,
      first: ENVIRONMENTS_PAGE_SIZE,
      after
    })
    const connection = result.environments

    environments.push(...connection.edges.map(edge => edge.node))
    hasNextPage = connection.pageInfo.hasNextPage

    if (!hasNextPage) {
      return environments
    }

    const nextCursor = connection.pageInfo.endCursor
    if (!nextCursor || nextCursor === after) {
      throw new Error(
        'Failed to paginate environments: Railway returned no next cursor'
      )
    }

    after = nextCursor
  }

  return environments
}
