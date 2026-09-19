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
  REUSE_PREVIEW_ENVIRONMENT: 'false',
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
import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'
import { serviceInstanceDeployV2 } from '../src/services/deployments/service-instance-deploy-v2'
import { updateEnvironmentVariablesForServices } from '../src/helpers/update-environment-variables-for-services'
import { waitForDeployment } from '../src/helpers/wait-for-deployment'

const createEnvironmentMock = createEnvironment as jest.MockedFunction<
  typeof createEnvironment
>
const getEnvironmentMock = getEnvironment as jest.MockedFunction<
  typeof getEnvironment
>
const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>
const getServiceDeploymentTargetsMock =
  getServiceDeploymentTargets as jest.MockedFunction<
    typeof getServiceDeploymentTargets
  >
const serviceInstanceDeployV2Mock =
  serviceInstanceDeployV2 as jest.MockedFunction<typeof serviceInstanceDeployV2>
const updateEnvironmentVariablesMock =
  updateEnvironmentVariablesForServices as jest.MockedFunction<
    typeof updateEnvironmentVariablesForServices
  >
const waitForDeploymentMock = waitForDeployment as jest.MockedFunction<
  typeof waitForDeployment
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

describe('create environment deployment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      { id: 'source-id', name: 'production', projectId: 'project-id' }
    ])
    createEnvironmentMock.mockResolvedValue({
      environmentCreate: { id: 'created-id' }
    } as never)
    getEnvironmentMock.mockResolvedValue(createdEnvironment)
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-id'],
      apiServiceId: 'service-id'
    })
    serviceInstanceDeployV2Mock.mockResolvedValue('deployment-id')
    updateEnvironmentVariablesMock.mockResolvedValue()
    waitForDeploymentMock.mockResolvedValue()
  })

  it('skips initial deploys and deploys the requested commit explicitly', async () => {
    await deploy()

    expect(createEnvironmentMock).toHaveBeenCalledWith({
      input: {
        name: 'pr-123',
        projectId: 'project-id',
        sourceEnvironmentId: 'source-id',
        skipInitialDeploys: true
      }
    })
    expect(getEnvironmentMock).toHaveBeenCalledWith({
      id: 'created-id',
      projectId: 'project-id'
    })
    expect(serviceInstanceDeployV2Mock).toHaveBeenCalledWith({
      commitSha: 'commit-sha',
      environmentId: 'created-id',
      serviceId: 'service-id'
    })
    expect(waitForDeploymentMock).toHaveBeenCalledWith('deployment-id')
  })
})
