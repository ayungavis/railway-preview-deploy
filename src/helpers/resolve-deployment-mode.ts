import type { ServiceSourceKind } from './classify-service-source'

export type DeploymentMode = 'commit' | 'image' | 'auto'

export type ResolvedDeploymentMode = 'commit' | 'image'

type ResolveDeploymentModeInput = {
  mode: string
  sourceKind: ServiceSourceKind
  commitSha?: string
  imageRef?: string
  updateDeploymentTriggers: string
}

export const resolveDeploymentMode = ({
  mode,
  sourceKind,
  commitSha,
  imageRef,
  updateDeploymentTriggers
}: ResolveDeploymentModeInput): ResolvedDeploymentMode => {
  if (!['commit', 'image', 'auto'].includes(mode)) {
    throw new Error(`Invalid deployment_mode: ${mode}`)
  }

  if (mode === 'commit') {
    if (!commitSha) {
      throw new Error('commit_sha is required for repository deployment')
    }

    if (imageRef) {
      throw new Error('image_ref cannot be used with deployment_mode commit')
    }

    if (sourceKind !== 'repository') {
      throw new Error(
        'deployment_mode commit requires a repository-backed service'
      )
    }

    return 'commit'
  }

  if (mode === 'auto' && sourceKind === 'repository') {
    if (!commitSha) {
      throw new Error('commit_sha is required for repository deployment')
    }

    return 'commit'
  }

  if (sourceKind !== 'image') {
    throw new Error('deployment_mode image requires an image-backed service')
  }

  if (!imageRef) {
    throw new Error('image_ref is required for image deployment')
  }

  if (mode === 'image' && commitSha) {
    throw new Error('commit_sha cannot be used for image deployment')
  }

  if (updateDeploymentTriggers === 'true') {
    throw new Error(
      'update_deployment_triggers cannot be enabled for image deployment'
    )
  }

  return 'image'
}
