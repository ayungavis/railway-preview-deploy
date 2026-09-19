jest.mock('@actions/core', () => ({
  info: jest.fn(),
  setFailed: jest.fn()
}))

jest.mock('../src/config', () => ({
  PREVIEW_ENVIRONMENT_NAME: 'pr-123',
  PROJECT_ENVIRONMENT_ID: 'source-id',
  PROJECT_ENVIRONMENT_NAME: 'production',
  PROJECT_ID: 'project-id'
}))

jest.mock('../src/services/environments/delete-environment', () => ({
  deleteEnvironment: jest.fn()
}))
jest.mock('../src/services/environments/get-environments', () => ({
  getAllEnvironments: jest.fn()
}))

import { cleanup } from '../src/scripts/cleanup'
import { deleteEnvironment } from '../src/services/environments/delete-environment'
import { getAllEnvironments } from '../src/services/environments/get-environments'

const deleteEnvironmentMock = deleteEnvironment as jest.MockedFunction<
  typeof deleteEnvironment
>
const getAllEnvironmentsMock = getAllEnvironments as jest.MockedFunction<
  typeof getAllEnvironments
>

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

describe('cleanup environment targeting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAllEnvironmentsMock.mockResolvedValue([
      sourceEnvironment,
      previewEnvironment
    ])
    deleteEnvironmentMock.mockResolvedValue({
      environmentDelete: true
    } as never)
  })

  it('deletes the matched preview environment by ID', async () => {
    await cleanup()

    expect(deleteEnvironmentMock).toHaveBeenCalledWith({ id: 'preview-id' })
  })

  it('does not delete when the preview name is ambiguous', async () => {
    getAllEnvironmentsMock.mockResolvedValue([
      sourceEnvironment,
      previewEnvironment,
      { id: 'duplicate-id', name: 'pr-123', projectId: 'project-id' }
    ])

    await cleanup()

    expect(deleteEnvironmentMock).not.toHaveBeenCalled()
  })

  it('does nothing when the preview environment is missing', async () => {
    getAllEnvironmentsMock.mockResolvedValue([sourceEnvironment])

    await cleanup()

    expect(deleteEnvironmentMock).not.toHaveBeenCalled()
  })
})
