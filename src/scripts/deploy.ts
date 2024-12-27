import * as core from '@actions/core'
import {
  API_SERVICE_NAME,
  BRANCH_NAME,
  ENVIRONMENT_VARIABLES,
  IGNORE_SERVICE_REDEPLOY,
  PREVIEW_ENVIRONMENT_NAME,
  PROJECT_ENVIRONMENT_ID,
  PROJECT_ENVIRONMENT_NAME,
  PROJECT_ID,
  REUSE_PREVIEW_ENVIRONMENT
} from '../config'
import { redeployAllServices } from '../helpers/redeploy-all-services'
import { setServiceDomainOutput } from '../helpers/set-service-domain-output'
import { updateAllDeploymentTriggers } from '../helpers/update-all-deployment-triggers'
import { updateEnvironmentVariablesForServices } from '../helpers/update-environment-variables-for-services'
import { createEnvironment } from '../services/environments/create-environment'
import { deleteEnvironment } from '../services/environments/delete-environment'
import { getEnvironments } from '../services/environments/get-environments'

export const deploy = async (): Promise<void> => {
  try {
    const ignoredServices = IGNORE_SERVICE_REDEPLOY
      ? JSON.parse(IGNORE_SERVICE_REDEPLOY)
      : []

    const { environments } = await getEnvironments({ projectId: PROJECT_ID })

    const selectedEnvironments = environments.edges.filter(
      edge => edge.node.name === PREVIEW_ENVIRONMENT_NAME
    )

    // if the environment exists, delete it
    if (selectedEnvironments.length >= 1) {
      const environmentId = selectedEnvironments[0].node.id
      core.info(
        `Environment found: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironments[0].node.id})`
      )

      if (REUSE_PREVIEW_ENVIRONMENT === 'true') {
        core.info(
          `Reusing environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironments[0].node.id})`
        )
        const { serviceInstances } = selectedEnvironments[0].node

        const servicesNeedRedeploy = await setServiceDomainOutput({
          serviceInstances,
          ignoredServices,
          apiServiceName: API_SERVICE_NAME
        })

        await redeployAllServices({
          environmentId,
          serviceIds: servicesNeedRedeploy
        })
        return
      } else {
        core.info(
          `Deleting environment: ${PROJECT_ENVIRONMENT_NAME} (id: ${environmentId})`
        )
        await deleteEnvironment({ id: environmentId })
      }
    }

    let projectEnvironmentId: string | undefined

    // If there is no environment ID provided, get the environment ID from the project environments list by name
    if (!PROJECT_ENVIRONMENT_ID) {
      projectEnvironmentId = environments.edges.find(
        edge => edge.node.name === PROJECT_ENVIRONMENT_NAME
      )?.node.id
    }

    if (!projectEnvironmentId) {
      throw new Error(`Environment not found: ${PROJECT_ENVIRONMENT_NAME}`)
    }

    const createdEnvironment = await createEnvironment({
      input: {
        name: PREVIEW_ENVIRONMENT_NAME,
        projectId: PROJECT_ID,
        sourceEnvironmentId: projectEnvironmentId
      }
    })
    console.log('Created environment:')
    console.dir(createdEnvironment.environmentCreate, { depth: null })

    const {
      id: environmentId,
      serviceInstances,
      deploymentTriggers
    } = createdEnvironment.environmentCreate

    const deploymentTriggerIds: string[] = []
    for (const deploymentTrigger of deploymentTriggers.edges) {
      const { id: deploymentTriggerId } = deploymentTrigger.node
      deploymentTriggerIds.push(deploymentTriggerId)
    }

    // Update the environment variables for the services
    await updateEnvironmentVariablesForServices({
      environmentId,
      projectId: PROJECT_ID,
      serviceInstances,
      environmentVariables: ENVIRONMENT_VARIABLES
    })

    console.log(
      'Waiting 15 seconds for deployments to initialize and become available...'
    )
    await new Promise(resolve => setTimeout(resolve, 15000))

    await updateAllDeploymentTriggers({
      deploymentTriggerIds,
      branchName: BRANCH_NAME
    })

    const servicesNeedRedeploy = await setServiceDomainOutput({
      serviceInstances,
      ignoredServices,
      apiServiceName: API_SERVICE_NAME
    })

    await redeployAllServices({
      environmentId,
      serviceIds: servicesNeedRedeploy
    })
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
