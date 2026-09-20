jest.mock('../src/services/service-instances/get-service', () => ({
  getService: jest.fn()
}))
jest.mock('../src/services/service-instances/get-service-instance', () => ({
  getServiceInstance: jest.fn()
}))

import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { getService } from '../src/services/service-instances/get-service'
import { getServiceInstance } from '../src/services/service-instances/get-service-instance'

const getServiceMock = jest.mocked(getService)
const getServiceInstanceMock = jest.mocked(getServiceInstance)

const serviceInstances = {
  edges: [
    { node: { id: 'instance-1', serviceId: 'service-1' } },
    { node: { id: 'instance-2', serviceId: 'service-2' } }
  ]
} as never

const service = (name: string): { service: { name: string } } => ({
  service: { name }
})
const source = (
  image: string | null,
  repo: string | null
): {
  id: string
  environmentId: string
  serviceId: string
  source: { image: string | null; repo: string | null }
} => ({
  id: 'instance-id',
  environmentId: 'environment-id',
  serviceId: 'service-id',
  source: { image, repo }
})

describe('getServiceDeploymentTargets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getServiceMock.mockImplementation(async ({ id }) =>
      id === 'service-1' ? service('web') : service('worker')
    )
  })

  it('resolves all repository services', async () => {
    getServiceInstanceMock
      .mockResolvedValueOnce(source(null, 'owner/web'))
      .mockResolvedValueOnce(source(null, 'owner/worker'))

    await expect(
      getServiceDeploymentTargets({
        environmentId: 'environment-id',
        serviceInstances,
        ignoredServices: [],
        apiServiceName: 'web'
      })
    ).resolves.toMatchObject({
      serviceIds: ['service-1', 'service-2'],
      apiServiceId: 'service-1',
      sourceKind: 'repository'
    })
  })

  it('rejects mixed service sources', async () => {
    getServiceInstanceMock
      .mockResolvedValueOnce(source(null, 'owner/web'))
      .mockResolvedValueOnce(source('ghcr.io/owner/worker:test', null))

    await expect(
      getServiceDeploymentTargets({
        environmentId: 'environment-id',
        serviceInstances,
        ignoredServices: [],
        apiServiceName: 'web'
      })
    ).rejects.toThrow('Mixed repository and Docker image services')
  })

  it('ignores excluded services when classifying source', async () => {
    getServiceInstanceMock.mockResolvedValueOnce(
      source('ghcr.io/owner/worker:test', null)
    )

    await expect(
      getServiceDeploymentTargets({
        environmentId: 'environment-id',
        serviceInstances,
        ignoredServices: ['web'],
        apiServiceName: 'worker'
      })
    ).resolves.toMatchObject({
      serviceIds: ['service-2'],
      sourceKind: 'image'
    })

    expect(getServiceInstanceMock).toHaveBeenCalledTimes(1)
  })

  it('keeps an ignored API service available for domain selection', async () => {
    getServiceMock.mockImplementation(async ({ id }) =>
      id === 'service-1' ? service('web') : service('worker')
    )
    getServiceInstanceMock.mockResolvedValueOnce(source(null, 'owner/worker'))

    await expect(
      getServiceDeploymentTargets({
        environmentId: 'environment-id',
        serviceInstances,
        ignoredServices: ['web'],
        apiServiceName: 'web'
      })
    ).resolves.toMatchObject({
      serviceIds: ['service-2'],
      apiServiceId: 'service-1',
      sourceKind: 'repository'
    })
  })
})
