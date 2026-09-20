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
  UPDATE_DEPLOYMENT_TRIGGERS: 'true',
  ENVIRONMENT_VARIABLES: '{}',
  IGNORE_SERVICE_REDEPLOY: '',
  PREVIEW_ENVIRONMENT_NAME: 'pr-123',
  PROJECT_ENVIRONMENT_ID: 'source-id',
  PROJECT_ENVIRONMENT_NAME: 'production',
  PROJECT_ID: 'project-id',
  REUSE_PREVIEW_ENVIRONMENT: 'true'
}))

jest.mock('../src/services/environments/get-environments', () => ({
  getAllEnvironments: jest.fn()
}))

import { deploy } from '../src/scripts/deploy'
import { getAllEnvironments } from '../src/services/environments/get-environments'

const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>

describe('deploy input validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([])
  })

  it('does not query Railway when branch_name is missing for commit triggers', async () => {
    await deploy()

    expect(getAllEnvironmentsMock).not.toHaveBeenCalled()
  })
})
