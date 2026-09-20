import { CreateEnvironmentMutation } from '../graphql/types'
import {
  classifyServiceSource,
  ServiceSourceKind
} from './classify-service-source'
import { getService } from '../services/service-instances/get-service'
import { getServiceInstance } from '../services/service-instances/get-service-instance'

type ServiceDeploymentTargets = {
  environmentId: string
  serviceInstances: CreateEnvironmentMutation['environmentCreate']['serviceInstances']
  ignoredServices: string[]
  apiServiceName?: string
}

export type DeploymentTargets = {
  serviceIds: string[]
  apiServiceId?: string
  sourceKind: ServiceSourceKind
}

export const getServiceDeploymentTargets = async ({
  environmentId,
  serviceInstances,
  ignoredServices,
  apiServiceName
}: ServiceDeploymentTargets): Promise<DeploymentTargets> => {
  const serviceIds: string[] = []
  let apiServiceId: string | undefined
  let fallbackApiServiceId: string | undefined
  let sourceKind: ServiceSourceKind | undefined

  for (const serviceInstance of serviceInstances.edges) {
    const { serviceId } = serviceInstance.node
    const { service } = await getService({ id: serviceId })
    const { name } = service

    if (apiServiceName && name === apiServiceName) {
      apiServiceId = serviceId
    }

    if (!fallbackApiServiceId && ['app', 'backend', 'web'].includes(name)) {
      fallbackApiServiceId = serviceId
    }

    if (ignoredServices.includes(name)) {
      continue
    }

    const serviceInstanceDetails = await getServiceInstance({
      environmentId,
      serviceId
    })
    const serviceSourceKind = classifyServiceSource(
      serviceInstanceDetails.source
    )

    if (sourceKind && sourceKind !== serviceSourceKind) {
      throw new Error(
        'Mixed repository and Docker image services are not supported in one deployment'
      )
    }

    if (serviceSourceKind === 'unknown') {
      throw new Error(`Unknown deployment source for service: ${name}`)
    }

    sourceKind = serviceSourceKind
    serviceIds.push(serviceId)
  }

  if (!sourceKind) {
    throw new Error('No services are available for deployment')
  }

  return {
    serviceIds,
    apiServiceId: apiServiceName ? apiServiceId : fallbackApiServiceId,
    sourceKind
  }
}
