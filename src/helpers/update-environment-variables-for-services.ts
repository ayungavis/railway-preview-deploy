import * as core from '@actions/core'
import { CreateEnvironmentMutation } from '../graphql/types'
import { variableCollectionUpsert } from '../services/environments/variable-collection-upsert'

type UpdateEnvironmentVariablesForServices = {
  environmentId: string
  projectId: string
  serviceInstances: CreateEnvironmentMutation['environmentCreate']['serviceInstances']
  environmentVariables: string
}

export const updateEnvironmentVariablesForServices = async ({
  environmentId,
  projectId,
  serviceInstances,
  environmentVariables
}: UpdateEnvironmentVariablesForServices): Promise<void> => {
  const parsedVariables = environmentVariables
    ? JSON.parse(environmentVariables)
    : {}
  const serviceIds = []

  for (const serviceInstance of serviceInstances.edges) {
    const { serviceId } = serviceInstance.node
    serviceIds.push(serviceId)
  }

  try {
    const updatePromises = serviceIds.map(
      async serviceId =>
        await variableCollectionUpsert({
          input: {
            environmentId,
            projectId,
            serviceId,
            variables: parsedVariables
          }
        })
    )

    await Promise.all(updatePromises)
    core.info('Environment variables updated for all services')
  } catch (error) {
    core.setFailed(
      `Failed to update environment variables for services: ${(error as Error).message}`
    )
    throw error
  }
}
