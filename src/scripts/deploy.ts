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
import {
  findPreviewEnvironment,
  resolveSourceEnvironment
} from '../helpers/environment-selection'
import { redeployAllServices } from '../helpers/redeploy-all-services'
import { setServiceDomainOutput } from '../helpers/set-service-domain-output'
import { updateAllDeploymentTriggers } from '../helpers/update-all-deployment-triggers'
import { updateEnvironmentVariablesForServices } from '../helpers/update-environment-variables-for-services'
import { createEnvironment } from '../services/environments/create-environment'
import { deleteEnvironment } from '../services/environments/delete-environment'
import { getEnvironment } from '../services/environments/get-environment'
import { getAllEnvironments } from '../services/environments/get-environments'

export const deploy = async (): Promise<void> => {
  try {
    const ignoredServices = IGNORE_SERVICE_REDEPLOY
      ? JSON.parse(IGNORE_SERVICE_REDEPLOY)
      : []
    const environments = await getAllEnvironments({ projectId: PROJECT_ID })
    const sourceEnvironment = resolveSourceEnvironment(environments, {
      projectId: PROJECT_ID,
      environmentId: PROJECT_ENVIRONMENT_ID || undefined,
      environmentName: PROJECT_ENVIRONMENT_NAME || undefined
    })
    const selectedEnvironment = findPreviewEnvironment(
      environments,
      PREVIEW_ENVIRONMENT_NAME,
      sourceEnvironment
    )

    if (selectedEnvironment) {
      core.info(
        `Environment found: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironment.id})`
      )

      if (REUSE_PREVIEW_ENVIRONMENT === 'true') {
        core.info(
          `Reusing environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironment.id})`
        )
        const existingEnvironment = await getEnvironment({
          id: selectedEnvironment.id,
          projectId: PROJECT_ID
        })

        setServiceDomainOutput({
          serviceInstances: existingEnvironment.serviceInstances,
          ignoredServices,
          apiServiceName: API_SERVICE_NAME
        })
        return
      }

      core.info(
        `Deleting environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironment.id})`
      )
      await deleteEnvironment({ id: selectedEnvironment.id })
    }

    const createdEnvironment = await createEnvironment({
      input: {
        name: PREVIEW_ENVIRONMENT_NAME,
        projectId: PROJECT_ID,
        sourceEnvironmentId: sourceEnvironment.id
      }
    })
    const environmentId = createdEnvironment.environmentCreate.id
    const environment = await getEnvironment({
      id: environmentId,
      projectId: PROJECT_ID
    })
    console.log('Created environment:')
    console.dir({ id: environment.id, name: environment.name }, { depth: null })

    const deploymentTriggerIds = environment.deploymentTriggers.edges.map(
      ({ node }) => node.id
    )

    // Update the environment variables for the services
    await updateEnvironmentVariablesForServices({
      environmentId: environment.id,
      projectId: PROJECT_ID,
      serviceInstances: environment.serviceInstances,
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
      serviceInstances: environment.serviceInstances,
      ignoredServices,
      apiServiceName: API_SERVICE_NAME
    })

    await redeployAllServices({
      environmentId: environment.id,
      serviceIds: servicesNeedRedeploy
    })
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
