jest.mock('@actions/core', () => ({
  info: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

jest.mock('../src/config', () => ({
  API_SERVICE_NAME: 'web',
  BRANCH_NAME: '',
  COMMIT_SHA: 'commit-sha',
  ENVIRONMENT_VARIABLES: '{}',
  IGNORE_SERVICE_REDEPLOY: '',
  PREVIEW_ENVIRONMENT_NAME: 'pr-123',
  PROJECT_ENVIRONMENT_ID: 'source-id',
  PROJECT_ENVIRONMENT_NAME: 'wrong-name',
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
jest.mock('../src/services/environments/create-environment', () => ({
  createEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/delete-environment', () => ({
  deleteEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/get-environment', () => ({
  getEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/get-environments', () => ({
  getAllEnvironments: jest.fn()
}))
jest.mock('../src/services/deployments/service-instance-deploy-v2', () => ({
  serviceInstanceDeployV2: jest.fn()
}))

import { deploy } from '../src/scripts/deploy'
import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { setServiceDomainOutput } from '../src/helpers/set-service-domain-output'
import { updateEnvironmentVariablesForServices } from '../src/helpers/update-environment-variables-for-services'
import { waitForDeployment } from '../src/helpers/wait-for-deployment'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'
import { serviceInstanceDeployV2 } from '../src/services/deployments/service-instance-deploy-v2'

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

const sourceEnvironment = {
  id: 'source-id',
  name: 'production',
  projectId: 'project-id'
}
const previewEnvironment = {
  id: 'preview-id',
  name: 'pr-123',
  projectId: 'project-id'
}
const previewDetails = {
  id: 'preview-id',
  name: 'pr-123',
  projectId: 'project-id',
  deploymentTriggers: { edges: [] },
  serviceInstances: {
    edges: [
      {
        node: {
          id: 'instance-id',
          serviceId: 'service-id',
          domains: {
            serviceDomains: [{ id: 'domain-id', domain: 'preview.example' }]
          }
        }
      }
    ]
  }
}

describe('deploy environment targeting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      sourceEnvironment,
      previewEnvironment
    ])
    getEnvironmentMock.mockResolvedValue(previewDetails)
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-id'],
      apiServiceId: 'service-id',
      sourceKind: 'repository'
    })
    serviceInstanceDeployV2Mock.mockResolvedValue('deployment-id')
    waitForDeploymentMock.mockResolvedValue()
    setServiceDomainOutputMock.mockResolvedValue()
    updateEnvironmentVariablesMock.mockResolvedValue()
  })

  it('syncs and deploys the requested commit when reusing a preview', async () => {
    await deploy()

    expect(getAllEnvironmentsMock).toHaveBeenCalledWith({
      projectId: 'project-id'
    })
    expect(getEnvironmentMock).toHaveBeenCalledWith({
      id: 'preview-id',
      projectId: 'project-id'
    })
    expect(updateEnvironmentVariablesMock).toHaveBeenCalledWith({
      environmentId: 'preview-id',
      projectId: 'project-id',
      serviceInstances: previewDetails.serviceInstances,
      environmentVariables: '{}'
    })
    expect(serviceInstanceDeployV2Mock).toHaveBeenCalledWith({
      commitSha: 'commit-sha',
      environmentId: 'preview-id',
      serviceId: 'service-id'
    })
    expect(waitForDeploymentMock).toHaveBeenCalledWith('deployment-id')
    expect(setServiceDomainOutputMock).toHaveBeenCalledWith({
      environmentId: 'preview-id',
      projectId: 'project-id',
      serviceId: 'service-id'
    })
  })
})
