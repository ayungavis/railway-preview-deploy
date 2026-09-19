import * as core from '@actions/core'
import {
  API_SERVICE_NAME,
  BRANCH_NAME,
  COMMIT_SHA,
  DEPLOYMENT_MODE,
  IMAGE_REF,
  ENVIRONMENT_VARIABLES,
  IGNORE_SERVICE_REDEPLOY,
  PREVIEW_ENVIRONMENT_NAME,
  PROJECT_ENVIRONMENT_ID,
  PROJECT_ENVIRONMENT_NAME,
  PROJECT_ID,
  REUSE_PREVIEW_ENVIRONMENT,
  UPDATE_DEPLOYMENT_TRIGGERS
} from '../config'
import {
  findPreviewEnvironment,
  resolveSourceEnvironment
} from '../helpers/environment-selection'
import { getServiceDeploymentTargets } from '../helpers/get-service-deployment-targets'
import { resolveDeploymentMode } from '../helpers/resolve-deployment-mode'
import { setServiceDomainOutput } from '../helpers/set-service-domain-output'
import { updateAllDeploymentTriggers } from '../helpers/update-all-deployment-triggers'
import { updateEnvironmentVariablesForServices } from '../helpers/update-environment-variables-for-services'
import { waitForDeployment } from '../helpers/wait-for-deployment'
import { createEnvironment } from '../services/environments/create-environment'
import { deleteEnvironment } from '../services/environments/delete-environment'
import { getEnvironment } from '../services/environments/get-environment'
import { getAllEnvironments } from '../services/environments/get-environments'
import { serviceInstanceDeployV2 } from '../services/deployments/service-instance-deploy-v2'
import { updateServiceInstanceSource } from '../services/service-instances/update-service-instance'

const parseIgnoredServices = (): string[] =>
  IGNORE_SERVICE_REDEPLOY ? JSON.parse(IGNORE_SERVICE_REDEPLOY) : []

const validateInputs = (): void => {
  if (!['commit', 'image', 'auto'].includes(DEPLOYMENT_MODE)) {
    throw new Error(`Invalid deployment_mode: ${DEPLOYMENT_MODE}`)
  }

  if (DEPLOYMENT_MODE === 'commit' && !COMMIT_SHA) {
    throw new Error('commit_sha is required for commit deployment')
  }
}

const validateImageRef = (): string => {
  if (!IMAGE_REF) {
    throw new Error('image_ref is required for image deployment')
  }

  return IMAGE_REF
}

export const deploy = async (): Promise<void> => {
  try {
    validateInputs()
    const ignoredServices = parseIgnoredServices()
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

    let environmentId = selectedEnvironment?.id

    if (selectedEnvironment && REUSE_PREVIEW_ENVIRONMENT !== 'true') {
      core.info(
        `Deleting environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${selectedEnvironment.id})`
      )
      await deleteEnvironment({ id: selectedEnvironment.id })
      environmentId = undefined
    }

    if (!environmentId) {
      const createdEnvironment = await createEnvironment({
        input: {
          name: PREVIEW_ENVIRONMENT_NAME,
          projectId: PROJECT_ID,
          sourceEnvironmentId: sourceEnvironment.id,
          skipInitialDeploys: true
        }
      })
      environmentId = createdEnvironment.environmentCreate.id
    } else {
      core.info(
        `Reusing environment: ${PREVIEW_ENVIRONMENT_NAME} (id: ${environmentId})`
      )
    }

    const environment = await getEnvironment({
      id: environmentId,
      projectId: PROJECT_ID
    })

    const { serviceIds, apiServiceId, sourceKind } =
      await getServiceDeploymentTargets({
        environmentId: environment.id,
        serviceInstances: environment.serviceInstances,
        ignoredServices,
        apiServiceName: API_SERVICE_NAME
      })

    const resolvedMode = resolveDeploymentMode({
      mode: DEPLOYMENT_MODE,
      sourceKind,
      commitSha: COMMIT_SHA || undefined,
      imageRef: IMAGE_REF || undefined,
      updateDeploymentTriggers: UPDATE_DEPLOYMENT_TRIGGERS
    })

    if (
      resolvedMode === 'commit' &&
      UPDATE_DEPLOYMENT_TRIGGERS === 'true' &&
      !BRANCH_NAME
    ) {
      throw new Error(
        'branch_name is required when update_deployment_triggers is enabled'
      )
    }

    await updateEnvironmentVariablesForServices({
      environmentId: environment.id,
      projectId: PROJECT_ID,
      serviceInstances: environment.serviceInstances,
      environmentVariables: ENVIRONMENT_VARIABLES
    })

    if (resolvedMode === 'image') {
      const imageRef = validateImageRef()
      await Promise.all(
        serviceIds.map(
          async serviceId =>
            await updateServiceInstanceSource({
              environmentId: environment.id,
              serviceId,
              image: imageRef
            })
        )
      )
    }

    if (resolvedMode === 'commit' && UPDATE_DEPLOYMENT_TRIGGERS === 'true') {
      await updateAllDeploymentTriggers({
        deploymentTriggerIds: environment.deploymentTriggers.edges.map(
          ({ node }) => node.id
        ),
        branchName: BRANCH_NAME
      })
    }

    if (serviceIds.length === 0) {
      throw new Error('No services are available for deployment')
    }

    const deploymentIds = await Promise.all(
      serviceIds.map(
        async serviceId =>
          await serviceInstanceDeployV2({
            ...(resolvedMode === 'commit' && { commitSha: COMMIT_SHA }),
            environmentId: environment.id,
            serviceId
          })
      )
    )

    await Promise.all(
      deploymentIds.map(
        async deploymentId => await waitForDeployment(deploymentId)
      )
    )

    if (!apiServiceId) {
      throw new Error('No API service found for the preview environment')
    }

    await setServiceDomainOutput({
      environmentId: environment.id,
      projectId: PROJECT_ID,
      serviceId: apiServiceId
    })
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
