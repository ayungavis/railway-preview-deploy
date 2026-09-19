jest.useFakeTimers()

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
  REUSE_PREVIEW_ENVIRONMENT: 'false'
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

import { createEnvironment } from '../src/services/environments/create-environment'
import { deploy } from '../src/scripts/deploy'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'

const createEnvironmentMock = createEnvironment as jest.MockedFunction<
  typeof createEnvironment
>
const getEnvironmentMock = getEnvironment as jest.MockedFunction<
  typeof getEnvironment
>
const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>

const createdEnvironment = {
  id: 'created-id',
  name: 'pr-123',
  projectId: 'project-id',
  deploymentTriggers: { edges: [] },
  serviceInstances: {
    edges: [
      {
        node: {
          id: 'instance-id',
          serviceId: 'service-id',
          domains: { serviceDomains: [] }
        }
      }
    ]
  }
}

describe('create environment targeting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      { id: 'source-id', name: 'production', projectId: 'project-id' }
    ])
    createEnvironmentMock.mockResolvedValue({
      environmentCreate: { id: 'created-id' }
    } as never)
    getEnvironmentMock.mockResolvedValue(createdEnvironment)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('creates from the resolved source ID and reloads target details', async () => {
    const deployment = deploy()
    await jest.runAllTimersAsync()
    await deployment

    expect(createEnvironmentMock).toHaveBeenCalledWith({
      input: {
        name: 'pr-123',
        projectId: 'project-id',
        sourceEnvironmentId: 'source-id'
      }
    })
    expect(getEnvironmentMock).toHaveBeenCalledWith({
      id: 'created-id',
      projectId: 'project-id'
    })
  })
})
