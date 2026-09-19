import { CreateEnvironmentMutation } from '../graphql/types'
import { getService } from '../services/service-instances/get-service'

type ServiceDeploymentTargets = {
  serviceInstances: CreateEnvironmentMutation['environmentCreate']['serviceInstances']
  ignoredServices: string[]
  apiServiceName?: string
}

export type DeploymentTargets = {
  serviceIds: string[]
  apiServiceId?: string
}

export const getServiceDeploymentTargets = async ({
  serviceInstances,
  ignoredServices,
  apiServiceName
}: ServiceDeploymentTargets): Promise<DeploymentTargets> => {
  const serviceIds: string[] = []
  let apiServiceId: string | undefined
  let fallbackApiServiceId: string | undefined

  for (const serviceInstance of serviceInstances.edges) {
    const { serviceId } = serviceInstance.node
    const { service } = await getService({ id: serviceId })
    const { name } = service

    if (!ignoredServices.includes(name)) {
      serviceIds.push(serviceId)
    }

    if (apiServiceName && name === apiServiceName) {
      apiServiceId = serviceId
    }

    if (!fallbackApiServiceId && ['app', 'backend', 'web'].includes(name)) {
      fallbackApiServiceId = serviceId
    }
  }

  return {
    serviceIds,
    apiServiceId: apiServiceName ? apiServiceId : fallbackApiServiceId
  }
}
