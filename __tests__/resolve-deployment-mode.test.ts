import { resolveDeploymentMode } from '../src/helpers/resolve-deployment-mode'

describe('resolveDeploymentMode', () => {
  it('defaults commit mode to repository deployment', () => {
    expect(
      resolveDeploymentMode({
        mode: 'commit',
        sourceKind: 'repository',
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      })
    ).toBe('commit')
  })

  it('requires commit SHA for repository deployment', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'commit',
        sourceKind: 'repository',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('commit_sha is required')
  })

  it('requires an image reference for image deployment', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'image',
        sourceKind: 'image',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('image_ref is required')
  })

  it('rejects conflicting image inputs', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'image',
        sourceKind: 'image',
        commitSha: 'sha',
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('commit_sha cannot be used')

    expect(() =>
      resolveDeploymentMode({
        mode: 'image',
        sourceKind: 'image',
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'true'
      })
    ).toThrow('update_deployment_triggers cannot be enabled')
  })

  it('resolves auto mode from the service source', () => {
    expect(
      resolveDeploymentMode({
        mode: 'auto',
        sourceKind: 'repository',
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      })
    ).toBe('commit')

    expect(
      resolveDeploymentMode({
        mode: 'auto',
        sourceKind: 'image',
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'false'
      })
    ).toBe('image')
  })
})
