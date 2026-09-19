import * as core from '@actions/core'
import { sdk } from '../../graphql/client'
import { GetDomainsQuery, GetDomainsQueryVariables } from '../../graphql/types'

export type Domains = GetDomainsQuery['domains']

export const getDomains = async (
  variables: GetDomainsQueryVariables
): Promise<Domains> => {
  try {
    const result = await sdk.GetDomains(variables)
    return result.domains
  } catch (error) {
    core.setFailed(`Failed to get domains: ${(error as Error).message}`)
    throw error
  }
}
