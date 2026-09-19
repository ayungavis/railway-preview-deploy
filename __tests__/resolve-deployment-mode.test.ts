import { resolveDeploymentMode } from '../src/helpers/resolve-deployment-mode'

describe('resolveDeploymentMode', () => {
  it.each([
    {
      name: 'commit repository',
      input: {
        mode: 'commit',
        sourceKind: 'repository' as const,
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      },
      expected: 'commit'
    },
    {
      name: 'auto repository',
      input: {
        mode: 'auto',
        sourceKind: 'repository' as const,
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      },
      expected: 'commit'
    },
    {
      name: 'image image',
      input: {
        mode: 'image',
        sourceKind: 'image' as const,
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'false'
      },
      expected: 'image'
    },
    {
      name: 'auto image',
      input: {
        mode: 'auto',
        sourceKind: 'image' as const,
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'false'
      },
      expected: 'image'
    }
  ])('$name resolves', ({ input, expected }) => {
    expect(resolveDeploymentMode(input)).toBe(expected)
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

  it('rejects auto repository deployment without a commit SHA', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'auto',
        sourceKind: 'repository',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('commit_sha is required')
  })

  it('rejects auto image deployment without an image reference', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'auto',
        sourceKind: 'image',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('image_ref is required')
  })

  it('rejects invalid and mismatched sources', () => {
    expect(() =>
      resolveDeploymentMode({
        mode: 'unknown',
        sourceKind: 'repository',
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('Invalid deployment_mode')

    expect(() =>
      resolveDeploymentMode({
        mode: 'commit',
        sourceKind: 'image',
        commitSha: 'sha',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('requires a repository-backed service')

    expect(() =>
      resolveDeploymentMode({
        mode: 'image',
        sourceKind: 'repository',
        imageRef: 'ghcr.io/example/app:test',
        updateDeploymentTriggers: 'false'
      })
    ).toThrow('requires an image-backed service')
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
