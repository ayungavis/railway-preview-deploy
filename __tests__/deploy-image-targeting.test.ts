jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

jest.mock('../src/config', () => ({
  API_SERVICE_NAME: 'web',
  BRANCH_NAME: '',
  COMMIT_SHA: '',
  DEPLOYMENT_MODE: 'image',
  IMAGE_REF: 'ghcr.io/example/app:pr-40-a1b2c3d',
  ENVIRONMENT_VARIABLES: '{}',
  IGNORE_SERVICE_REDEPLOY: '',
  PREVIEW_ENVIRONMENT_NAME: 'pr-123',
  PROJECT_ENVIRONMENT_ID: 'source-id',
  PROJECT_ENVIRONMENT_NAME: 'production',
  PROJECT_ID: 'project-id',
  REUSE_PREVIEW_ENVIRONMENT: 'true',
  UPDATE_DEPLOYMENT_TRIGGERS: 'false'
}))

jest.mock('../src/helpers/get-service-deployment-targets', () => ({
  getServiceDeploymentTargets: jest.fn()
}))
jest.mock('../src/helpers/set-service-domain-output', () => ({
  setServiceDomainOutput: jest.fn()
}))
jest.mock('../src/helpers/update-all-deployment-triggers', () => ({
  updateAllDeploymentTriggers: jest.fn()
}))
jest.mock('../src/helpers/update-environment-variables-for-services', () => ({
  updateEnvironmentVariablesForServices: jest.fn()
}))
jest.mock('../src/helpers/wait-for-deployment', () => ({
  waitForDeployment: jest.fn()
}))
jest.mock('../src/services/deployments/service-instance-deploy-v2', () => ({
  serviceInstanceDeployV2: jest.fn()
}))
jest.mock('../src/services/environments/get-environment', () => ({
  getEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/get-environments', () => ({
  getAllEnvironments: jest.fn()
}))
jest.mock('../src/services/service-instances/update-service-instance', () => ({
  updateServiceInstanceSource: jest.fn()
}))

import { deploy } from '../src/scripts/deploy'
import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { setServiceDomainOutput } from '../src/helpers/set-service-domain-output'
import { updateAllDeploymentTriggers } from '../src/helpers/update-all-deployment-triggers'
import { updateEnvironmentVariablesForServices } from '../src/helpers/update-environment-variables-for-services'
import { waitForDeployment } from '../src/helpers/wait-for-deployment'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'
import { serviceInstanceDeployV2 } from '../src/services/deployments/service-instance-deploy-v2'
import { updateServiceInstanceSource } from '../src/services/service-instances/update-service-instance'

const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>
const getEnvironmentMock = getEnvironment as jest.MockedFunction<
  typeof getEnvironment
>
const getServiceDeploymentTargetsMock =
  getServiceDeploymentTargets as jest.MockedFunction<
    typeof getServiceDeploymentTargets
  >
const setServiceDomainOutputMock =
  setServiceDomainOutput as jest.MockedFunction<typeof setServiceDomainOutput>
const updateAllDeploymentTriggersMock =
  updateAllDeploymentTriggers as jest.MockedFunction<
    typeof updateAllDeploymentTriggers
  >
const updateEnvironmentVariablesMock =
  updateEnvironmentVariablesForServices as jest.MockedFunction<
    typeof updateEnvironmentVariablesForServices
  >
const waitForDeploymentMock = waitForDeployment as jest.MockedFunction<
  typeof waitForDeployment
>
const serviceInstanceDeployV2Mock =
  serviceInstanceDeployV2 as jest.MockedFunction<typeof serviceInstanceDeployV2>
const updateServiceInstanceSourceMock =
  updateServiceInstanceSource as jest.MockedFunction<
    typeof updateServiceInstanceSource
  >

const details = {
  id: 'preview-id',
  name: 'pr-123',
  projectId: 'project-id',
  deploymentTriggers: { edges: [] },
  serviceInstances: { edges: [] }
}

describe('image deployment path', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      { id: 'source-id', name: 'production', projectId: 'project-id' },
      { id: 'preview-id', name: 'pr-123', projectId: 'project-id' }
    ])
    getEnvironmentMock.mockResolvedValue(details as never)
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-1', 'service-2'],
      apiServiceId: 'service-1',
      sourceKind: 'image'
    })
    updateEnvironmentVariablesMock.mockResolvedValue()
    updateServiceInstanceSourceMock.mockResolvedValue({
      serviceInstanceUpdate: true
    })
    serviceInstanceDeployV2Mock.mockResolvedValueOnce('deployment-1')
    serviceInstanceDeployV2Mock.mockResolvedValueOnce('deployment-2')
    waitForDeploymentMock.mockResolvedValue()
    setServiceDomainOutputMock.mockResolvedValue()
  })

  it('updates images, deploys without commit SHA, polls, then sets domain', async () => {
    await deploy()

    expect(updateEnvironmentVariablesMock).toHaveBeenCalled()
    expect(updateServiceInstanceSourceMock).toHaveBeenNthCalledWith(1, {
      environmentId: 'preview-id',
      serviceId: 'service-1',
      image: 'ghcr.io/example/app:pr-40-a1b2c3d'
    })
    expect(updateServiceInstanceSourceMock).toHaveBeenNthCalledWith(2, {
      environmentId: 'preview-id',
      serviceId: 'service-2',
      image: 'ghcr.io/example/app:pr-40-a1b2c3d'
    })
    expect(serviceInstanceDeployV2Mock).toHaveBeenNthCalledWith(1, {
      environmentId: 'preview-id',
      serviceId: 'service-1'
    })
    expect(serviceInstanceDeployV2Mock).toHaveBeenNthCalledWith(2, {
      environmentId: 'preview-id',
      serviceId: 'service-2'
    })
    expect(updateAllDeploymentTriggersMock).not.toHaveBeenCalled()
    expect(waitForDeploymentMock).toHaveBeenCalledWith('deployment-1')
    expect(waitForDeploymentMock).toHaveBeenCalledWith('deployment-2')
    expect(setServiceDomainOutputMock).toHaveBeenCalledWith({
      environmentId: 'preview-id',
      projectId: 'project-id',
      serviceId: 'service-1'
    })
  })
})
