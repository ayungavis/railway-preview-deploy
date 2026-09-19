import {
  findPreviewEnvironment,
  resolveSourceEnvironment,
  EnvironmentSummary
} from '../src/helpers/environment-selection'

const environment = (
  id: string,
  name: string,
  projectId = 'project-id'
): EnvironmentSummary => ({ id, name, projectId })

describe('environment selection', () => {
  const environments = [
    environment('source-id', 'production'),
    environment('preview-id', 'pr-123')
  ]

  it('prefers the source environment ID over its name', () => {
    expect(
      resolveSourceEnvironment(environments, {
        projectId: 'project-id',
        environmentId: 'source-id',
        environmentName: 'missing'
      })
    ).toEqual(environments[0])
  })

  it('resolves a source environment by name', () => {
    expect(
      resolveSourceEnvironment(environments, {
        projectId: 'project-id',
        environmentName: 'production'
      })
    ).toEqual(environments[0])
  })

  it('rejects missing, unknown, and ambiguous source environments', () => {
    expect(() =>
      resolveSourceEnvironment(environments, { projectId: 'project-id' })
    ).toThrow('Either environment_id or environment_name must be provided')

    expect(() =>
      resolveSourceEnvironment(environments, {
        projectId: 'project-id',
        environmentId: 'missing-id'
      })
    ).toThrow('Environment not found in project: missing-id')

    expect(() =>
      resolveSourceEnvironment(
        [...environments, environment('other-id', 'production')],
        { projectId: 'project-id', environmentName: 'production' }
      )
    ).toThrow('Multiple environments found: production')

    expect(
      resolveSourceEnvironment(
        [
          ...environments,
          environment('foreign-id', 'production', 'other-project')
        ],
        { projectId: 'project-id', environmentName: 'production' }
      )
    ).toEqual(environments[0])
  })

  it('rejects a preview name that targets the source environment', () => {
    expect(() =>
      findPreviewEnvironment(environments, 'production', environments[0])
    ).toThrow(
      'preview_environment_name must differ from the source environment'
    )
  })

  it('rejects duplicate preview names and returns a single match', () => {
    expect(
      findPreviewEnvironment(environments, 'pr-123', environments[0])
    ).toEqual(environments[1])

    expect(() =>
      findPreviewEnvironment(
        [...environments, environment('duplicate-id', 'pr-123')],
        'pr-123',
        environments[0]
      )
    ).toThrow('Multiple environments found: pr-123')

    expect(
      findPreviewEnvironment(
        [...environments, environment('foreign-id', 'pr-123', 'other-project')],
        'pr-123',
        environments[0]
      )
    ).toEqual(environments[1])
  })
})
