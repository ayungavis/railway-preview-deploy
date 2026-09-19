import { getDeployment } from '../services/deployments/get-deployment'

const POLL_INTERVAL_MS = 5000
const POLL_TIMEOUT_MS = 10 * 60 * 1000
const SUCCESS_STATUS = 'SUCCESS'
const FAILURE_STATUSES = new Set([
  'FAILED',
  'CRASHED',
  'SKIPPED',
  'REMOVING',
  'REMOVED'
])

const sleep = async (milliseconds: number): Promise<void> =>
  await new Promise(resolve => setTimeout(resolve, milliseconds))

type WaitForDeploymentOptions = {
  now?: () => number
  poll?: typeof getDeployment
  sleep?: (milliseconds: number) => Promise<void>
  timeoutMs?: number
  intervalMs?: number
}

export const waitForDeployment = async (
  deploymentId: string,
  {
    now = Date.now,
    poll = getDeployment,
    sleep: wait = sleep,
    timeoutMs = POLL_TIMEOUT_MS,
    intervalMs = POLL_INTERVAL_MS
  }: WaitForDeploymentOptions = {}
): Promise<void> => {
  const startedAt = now()
  let lastStatus = 'UNKNOWN'

  while (now() - startedAt <= timeoutMs) {
    const deployment = await poll(deploymentId)
    lastStatus = deployment.status

    if (deployment.status === SUCCESS_STATUS) {
      return
    }

    if (FAILURE_STATUSES.has(deployment.status)) {
      throw new Error(
        `Deployment ${deploymentId} failed with status ${deployment.status}`
      )
    }

    await wait(intervalMs)
  }

  throw new Error(
    `Deployment ${deploymentId} timed out with status ${lastStatus}`
  )
}
