import type { GetEnvironmentsQuery } from '../graphql/types'

export type EnvironmentSummary =
  GetEnvironmentsQuery['environments']['edges'][number]['node']

type SourceEnvironmentOptions = {
  projectId: string
  environmentId?: string
  environmentName?: string
}

export const resolveSourceEnvironment = (
  environments: EnvironmentSummary[],
  { projectId, environmentId, environmentName }: SourceEnvironmentOptions
): EnvironmentSummary => {
  if (!environmentId && !environmentName) {
    throw new Error(
      'Either environment_id or environment_name must be provided'
    )
  }

  if (environmentId) {
    const environment = environments.find(({ id }) => id === environmentId)

    if (!environment || environment.projectId !== projectId) {
      throw new Error(`Environment not found in project: ${environmentId}`)
    }

    return environment
  }

  const matchingEnvironments = environments.filter(
    ({ name, projectId: environmentProjectId }) =>
      name === environmentName && environmentProjectId === projectId
  )

  if (matchingEnvironments.length === 0) {
    throw new Error(`Environment not found: ${environmentName}`)
  }

  if (matchingEnvironments.length > 1) {
    throw new Error(`Multiple environments found: ${environmentName}`)
  }

  return matchingEnvironments[0]
}

export const findPreviewEnvironment = (
  environments: EnvironmentSummary[],
  previewEnvironmentName: string,
  sourceEnvironment: EnvironmentSummary
): EnvironmentSummary | undefined => {
  if (!previewEnvironmentName) {
    throw new Error('preview_environment_name must be provided')
  }

  if (previewEnvironmentName === sourceEnvironment.name) {
    throw new Error(
      'preview_environment_name must differ from the source environment'
    )
  }

  const matchingEnvironments = environments.filter(
    ({ name, projectId }) =>
      name === previewEnvironmentName &&
      projectId === sourceEnvironment.projectId
  )

  if (matchingEnvironments.length > 1) {
    throw new Error(`Multiple environments found: ${previewEnvironmentName}`)
  }

  const previewEnvironment = matchingEnvironments[0]

  if (previewEnvironment?.id === sourceEnvironment.id) {
    throw new Error(
      'preview_environment_name must not target the source environment'
    )
  }

  return previewEnvironment
}
