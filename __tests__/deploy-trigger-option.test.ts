jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

jest.mock('../src/config', () => ({
  API_SERVICE_NAME: 'web',
  BRANCH_NAME: 'feature-branch',
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
  UPDATE_DEPLOYMENT_TRIGGERS: 'true'
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

import { deploy } from '../src/scripts/deploy'
import { getServiceDeploymentTargets } from '../src/helpers/get-service-deployment-targets'
import { setServiceDomainOutput } from '../src/helpers/set-service-domain-output'
import { updateAllDeploymentTriggers } from '../src/helpers/update-all-deployment-triggers'
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

const details = {
  id: 'preview-id',
  name: 'pr-123',
  projectId: 'project-id',
  deploymentTriggers: {
    edges: [{ node: { id: 'trigger-1' } }, { node: { id: 'trigger-2' } }]
  },
  serviceInstances: { edges: [] }
}

describe('deployment trigger option', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      { id: 'source-id', name: 'production', projectId: 'project-id' },
      { id: 'preview-id', name: 'pr-123', projectId: 'project-id' }
    ])
    getEnvironmentMock.mockResolvedValue(details as never)
    updateEnvironmentVariablesMock.mockResolvedValue()
    updateAllDeploymentTriggersMock.mockResolvedValue()
    getServiceDeploymentTargetsMock.mockResolvedValue({
      serviceIds: ['service-id'],
      apiServiceId: 'service-id',
      sourceKind: 'repository'
    })
    serviceInstanceDeployV2Mock.mockResolvedValue('deployment-id')
    waitForDeploymentMock.mockResolvedValue()
    setServiceDomainOutputMock.mockResolvedValue()
  })

  it('updates triggers only when explicitly enabled', async () => {
    await deploy()

    expect(updateAllDeploymentTriggersMock).toHaveBeenCalledWith({
      deploymentTriggerIds: ['trigger-1', 'trigger-2'],
      branchName: 'feature-branch'
    })
  })

  it('does not deploy when trigger updates fail', async () => {
    updateAllDeploymentTriggersMock.mockRejectedValueOnce(
      new Error('trigger update failed')
    )

    await deploy()

    expect(serviceInstanceDeployV2Mock).not.toHaveBeenCalled()
  })

  it('does not deploy when variable sync fails', async () => {
    updateEnvironmentVariablesMock.mockRejectedValueOnce(
      new Error('variable sync failed')
    )

    await deploy()

    expect(updateAllDeploymentTriggersMock).not.toHaveBeenCalled()
    expect(serviceInstanceDeployV2Mock).not.toHaveBeenCalled()
  })
})
