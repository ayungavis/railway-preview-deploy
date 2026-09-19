jest.mock('@actions/core', () => ({
  setFailed: jest.fn()
}))

jest.mock('../src/graphql/client', () => ({
  sdk: {
    GetServiceInstance: jest.fn(),
    ServiceInstanceUpdate: jest.fn(),
    ServiceInstanceDeployV2: jest.fn()
  }
}))

import { sdk } from '../src/graphql/client'
import { serviceInstanceDeployV2 } from '../src/services/deployments/service-instance-deploy-v2'
import { getServiceInstance } from '../src/services/service-instances/get-service-instance'
import { updateServiceInstanceSource } from '../src/services/service-instances/update-service-instance'

const getServiceInstanceMock = jest.mocked(
  Reflect.get(sdk, 'GetServiceInstance')
)
const serviceInstanceUpdateMock = jest.mocked(
  Reflect.get(sdk, 'ServiceInstanceUpdate')
)
const serviceInstanceDeployV2Mock = jest.mocked(
  Reflect.get(sdk, 'ServiceInstanceDeployV2')
)

describe('service instance source operations', () => {
  beforeEach(() => {
    getServiceInstanceMock.mockReset()
    serviceInstanceUpdateMock.mockReset()
    serviceInstanceDeployV2Mock.mockReset()
  })

  it('reads repository and image source fields by environment and service', async () => {
    getServiceInstanceMock.mockResolvedValue({
      serviceInstance: {
        id: 'instance-id',
        environmentId: 'environment-id',
        serviceId: 'service-id',
        source: { image: null, repo: 'owner/repository' }
      }
    })

    await expect(
      getServiceInstance({
        environmentId: 'environment-id',
        serviceId: 'service-id'
      })
    ).resolves.toMatchObject({
      source: { repo: 'owner/repository' }
    })

    expect(getServiceInstanceMock).toHaveBeenCalledWith({
      environmentId: 'environment-id',
      serviceId: 'service-id'
    })
  })

  it('updates the exact image reference', async () => {
    serviceInstanceUpdateMock.mockResolvedValue({
      serviceInstanceUpdate: true
    })

    await updateServiceInstanceSource({
      environmentId: 'environment-id',
      serviceId: 'service-id',
      image: 'ghcr.io/example/app:pr-40-a1b2c3d'
    })

    expect(serviceInstanceUpdateMock).toHaveBeenCalledWith({
      environmentId: 'environment-id',
      serviceId: 'service-id',
      input: {
        source: { image: 'ghcr.io/example/app:pr-40-a1b2c3d' }
      }
    })
  })

  it('rejects a false image update result', async () => {
    serviceInstanceUpdateMock.mockResolvedValue({
      serviceInstanceUpdate: false
    })

    await expect(
      updateServiceInstanceSource({
        environmentId: 'environment-id',
        serviceId: 'service-id',
        image: 'ghcr.io/example/app:test'
      })
    ).rejects.toThrow('Railway rejected the image update')
  })

  it('allows deployment without a commit SHA at the GraphQL boundary', async () => {
    serviceInstanceDeployV2Mock.mockResolvedValue({
      serviceInstanceDeployV2: 'deployment-id'
    })

    await expect(
      serviceInstanceDeployV2({
        environmentId: 'environment-id',
        serviceId: 'service-id'
      })
    ).resolves.toBe('deployment-id')

    expect(serviceInstanceDeployV2Mock).toHaveBeenCalledWith({
      commitSha: undefined,
      environmentId: 'environment-id',
      serviceId: 'service-id'
    })
  })
})
