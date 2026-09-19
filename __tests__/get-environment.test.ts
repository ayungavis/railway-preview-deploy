jest.mock('@actions/core', () => ({
  setFailed: jest.fn()
}))

jest.mock('../src/graphql/client', () => ({
  sdk: {
    GetEnvironment: jest.fn()
  }
}))

import { sdk } from '../src/graphql/client'
import { getEnvironment } from '../src/services/environments/get-environment'

const getEnvironmentMock = jest.mocked(Reflect.get(sdk, 'GetEnvironment'))

const details = {
  id: 'environment-id',
  name: 'production',
  projectId: 'project-id',
  deploymentTriggers: { edges: [] },
  serviceInstances: { edges: [] }
}

describe('getEnvironment', () => {
  beforeEach(() => {
    getEnvironmentMock.mockReset()
  })

  it('returns details for the requested project', async () => {
    getEnvironmentMock.mockResolvedValue({ environment: details })

    await expect(
      getEnvironment({ id: 'environment-id', projectId: 'project-id' })
    ).resolves.toEqual(details)
  })

  it('rejects missing or cross-project environments', async () => {
    getEnvironmentMock.mockResolvedValueOnce({ environment: null })
    await expect(
      getEnvironment({ id: 'missing-id', projectId: 'project-id' })
    ).rejects.toThrow('Environment not found: missing-id')

    getEnvironmentMock.mockResolvedValueOnce({
      environment: { ...details, projectId: 'other-project' }
    })
    await expect(
      getEnvironment({ id: 'environment-id', projectId: 'project-id' })
    ).rejects.toThrow('Environment not found in project: environment-id')
  })
})
