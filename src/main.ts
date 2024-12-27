import * as core from '@actions/core'
import { IS_CLEANUP } from './config'
import { cleanup } from './scripts/cleanup'
import { deploy } from './scripts/deploy'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (IS_CLEANUP === 'true') {
      await cleanup()
      return
    } else {
      await deploy()
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
