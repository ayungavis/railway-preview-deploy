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
  DEPLOYMENT_MODE: 'commit',
  IMAGE_REF: '',
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
jest.mock('../src/helpers/update-environment-variables-for-services', () => ({
  updateEnvironmentVariablesForServices: jest.fn()
}))
jest.mock('../src/services/environments/get-environment', () => ({
  getEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/get-environments', () => ({
  getAllEnvironments: jest.fn()
}))

import { deploy } from '../src/scripts/deploy'
import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { updateEnvironmentVariablesForServices } from '../src/helpers/update-environment-variables-for-services'
import { getEnvironment } from '../src/services/environments/get-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'

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
const updateEnvironmentVariablesMock =
  updateEnvironmentVariablesForServices as jest.MockedFunction<
    typeof updateEnvironmentVariablesForServices
  >

const details = {
  id: 'preview-id',
  name: 'pr-123',
  projectId: 'project-id',
  deploymentTriggers: { edges: [] },
  serviceInstances: { edges: [] }
}

describe('commit deployment source guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      { id: 'source-id', name: 'production', projectId: 'project-id' },
      { id: 'preview-id', name: 'pr-123', projectId: 'project-id' }
    ])
    getEnvironmentMock.mockResolvedValue(details as never)
    updateEnvironmentVariablesMock.mockResolvedValue()
  })

  it.each(['image', 'unknown'] as const)(
    'stops before variable sync for %s sources',
    async sourceKind => {
      getServiceDeploymentTargetsMock.mockResolvedValueOnce({
        serviceIds: ['service-id'],
        apiServiceId: 'service-id',
        sourceKind
      })

      await deploy()

      expect(updateEnvironmentVariablesMock).not.toHaveBeenCalled()
    }
  )
})
