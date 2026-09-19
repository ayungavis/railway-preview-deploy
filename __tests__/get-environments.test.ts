jest.mock('../src/graphql/client', () => ({
  sdk: {
    GetEnvironments: jest.fn()
  }
}))

import { sdk } from '../src/graphql/client'
import { getAllEnvironments } from '../src/services/environments/get-environments'

const getEnvironmentsMock = jest.mocked(Reflect.get(sdk, 'GetEnvironments'))

type EnvironmentNode = {
  id: string
  name: string
  projectId: string
}

type EnvironmentPage = {
  environments: {
    edges: { node: EnvironmentNode }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

const page = (
  environments: EnvironmentNode[],
  hasNextPage: boolean,
  endCursor: string | null = null
): EnvironmentPage => ({
  environments: {
    edges: environments.map(node => ({ node })),
    pageInfo: { hasNextPage, endCursor }
  }
})

describe('getAllEnvironments', () => {
  beforeEach(() => {
    getEnvironmentsMock.mockReset()
  })

  it('loads every page using the returned cursor', async () => {
    getEnvironmentsMock
      .mockResolvedValueOnce(
        page(
          [{ id: 'one', name: 'production', projectId: 'project-id' }],
          true,
          'cursor-1'
        )
      )
      .mockResolvedValueOnce(
        page([{ id: 'two', name: 'preview', projectId: 'project-id' }], false)
      )

    await expect(
      getAllEnvironments({ projectId: 'project-id' })
    ).resolves.toEqual([
      { id: 'one', name: 'production', projectId: 'project-id' },
      { id: 'two', name: 'preview', projectId: 'project-id' }
    ])

    expect(getEnvironmentsMock).toHaveBeenNthCalledWith(1, {
      projectId: 'project-id',
      first: 100,
      after: undefined
    })
    expect(getEnvironmentsMock).toHaveBeenNthCalledWith(2, {
      projectId: 'project-id',
      first: 100,
      after: 'cursor-1'
    })
  })

  it('rejects a page that claims another page without a cursor', async () => {
    getEnvironmentsMock.mockResolvedValueOnce(
      page([{ id: 'one', name: 'production', projectId: 'project-id' }], true)
    )

    await expect(
      getAllEnvironments({ projectId: 'project-id' })
    ).rejects.toThrow('Railway returned no next cursor')
  })
})
