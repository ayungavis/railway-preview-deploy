jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

jest.mock('../src/config', () => ({
  API_SERVICE_NAME: 'web',
  BRANCH_NAME: '',
  COMMIT_SHA: 'commit-sha',
  DEPLOYMENT_MODE: 'auto',
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

const environments = [
  { id: 'source-id', name: 'production', projectId: 'project-id' },
  { id: 'preview-id', name: 'pr-123', projectId: 'project-id' }
]

describe('auto deployment mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue(environments)
    getEnvironmentMock.mockResolvedValue(details as never)
    updateEnvironmentVariablesMock.mockResolvedValue()
    serviceInstanceDeployV2Mock.mockResolvedValue('deployment-id')
    waitForDeploymentMock.mockResolvedValue()
    setServiceDomainOutputMock.mockResolvedValue()
    updateServiceInstanceSourceMock.mockResolvedValue({
      serviceInstanceUpdate: true
    })
  })

  it('uses the image path for image-backed services', async () => {
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-id'],
      apiServiceId: 'service-id',
      sourceKind: 'image'
    })

    await deploy()

    expect(updateServiceInstanceSourceMock).toHaveBeenCalledWith({
      environmentId: 'preview-id',
      serviceId: 'service-id',
      image: 'ghcr.io/example/app:pr-40-a1b2c3d'
    })
    expect(serviceInstanceDeployV2Mock).toHaveBeenCalledWith({
      environmentId: 'preview-id',
      serviceId: 'service-id'
    })
  })

  it('uses the commit path for repository-backed services', async () => {
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-id'],
      apiServiceId: 'service-id',
      sourceKind: 'repository'
    })

    await deploy()

    expect(updateServiceInstanceSourceMock).not.toHaveBeenCalled()
    expect(serviceInstanceDeployV2Mock).toHaveBeenCalledWith({
      commitSha: 'commit-sha',
      environmentId: 'preview-id',
      serviceId: 'service-id'
    })
  })
})
