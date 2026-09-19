import { waitForDeployment } from '../src/helpers/wait-for-deployment'

type Deployment = {
  id: string
  status: string
}

const deployment = (status: string): Deployment => ({
  id: 'deployment-id',
  status
})

describe('waitForDeployment', () => {
  it('returns immediately for a successful deployment', async () => {
    const poll = jest.fn().mockResolvedValue(deployment('SUCCESS'))

    await expect(
      waitForDeployment('deployment-id', {
        poll: poll as never,
        sleep: jest.fn()
      })
    ).resolves.toBeUndefined()
    expect(poll).toHaveBeenCalledTimes(1)
  })

  it.each(['FAILED', 'CRASHED', 'SKIPPED', 'REMOVING', 'REMOVED'])(
    'rejects terminal status %s',
    async status => {
      await expect(
        waitForDeployment('deployment-id', {
          poll: jest.fn().mockResolvedValue(deployment(status)) as never,
          sleep: jest.fn()
        })
      ).rejects.toThrow(`Deployment deployment-id failed with status ${status}`)
    }
  )

  it('polls transient statuses before success', async () => {
    const poll = jest
      .fn()
      .mockResolvedValueOnce(deployment('BUILDING'))
      .mockResolvedValueOnce(deployment('DEPLOYING'))
      .mockResolvedValueOnce(deployment('SUCCESS'))
    const sleep = jest.fn().mockResolvedValue(undefined)

    await waitForDeployment('deployment-id', {
      poll: poll as never,
      sleep,
      intervalMs: 1
    })

    expect(poll).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenCalledTimes(2)
  })

  it('fails when the timeout is reached', async () => {
    let currentTime = 0
    const poll = jest.fn().mockResolvedValue(deployment('QUEUED'))

    await expect(
      waitForDeployment('deployment-id', {
        poll: poll as never,
        sleep: async () => {
          currentTime += 11
        },
        now: () => currentTime,
        timeoutMs: 10,
        intervalMs: 1
      })
    ).rejects.toThrow('Deployment deployment-id timed out with status QUEUED')
  })
})
