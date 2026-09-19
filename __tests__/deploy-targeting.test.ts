jest.mock('@actions/core', () => ({
  info: jest.fn(),
  setFailed: jest.fn()
}))

jest.mock('../src/config', () => ({
  API_SERVICE_NAME: 'web',
  BRANCH_NAME: 'feature',
  ENVIRONMENT_VARIABLES: '{}',
  IGNORE_SERVICE_REDEPLOY: '',
  PREVIEW_ENVIRONMENT_NAME: 'pr-123',
  PROJECT_ENVIRONMENT_ID: 'source-id',
  PROJECT_ENVIRONMENT_NAME: 'wrong-name',
  PROJECT_ID: 'project-id',
  REUSE_PREVIEW_ENVIRONMENT: 'true'
}))

jest.mock('../src/helpers/redeploy-all-services', () => ({
  redeployAllServices: jest.fn()
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

import { deploy } from '../src/scripts/deploy'
import { setServiceDomainOutput } from '../src/helpers/set-service-domain-output'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'

const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>
const getEnvironmentMock = getEnvironment as jest.MockedFunction<
  typeof getEnvironment
>
const setServiceDomainOutputMock =
  setServiceDomainOutput as jest.MockedFunction<typeof setServiceDomainOutput>

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
    setServiceDomainOutputMock.mockResolvedValue([])
  })

  it('uses the source ID and authoritative details when reusing a preview', async () => {
    await deploy()

    expect(getAllEnvironmentsMock).toHaveBeenCalledWith({
      projectId: 'project-id'
    })
    expect(getEnvironmentMock).toHaveBeenCalledWith({
      id: 'preview-id',
      projectId: 'project-id'
    })
    expect(setServiceDomainOutputMock).toHaveBeenCalledWith({
      serviceInstances: previewDetails.serviceInstances,
      ignoredServices: [],
      apiServiceName: 'web'
    })
  })
})
