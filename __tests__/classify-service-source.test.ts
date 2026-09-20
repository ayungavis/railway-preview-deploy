import { classifyServiceSource } from '../src/helpers/classify-service-source'

describe('classifyServiceSource', () => {
  it('classifies a repository source', () => {
    expect(classifyServiceSource({ image: null, repo: 'owner/repo' })).toBe(
      'repository'
    )
  })

  it('classifies an image source', () => {
    expect(
      classifyServiceSource({ image: 'ghcr.io/example/app:test', repo: null })
    ).toBe('image')
  })

  it.each([
    null,
    undefined,
    { image: null, repo: null },
    { image: 'ghcr.io/example/app:test', repo: 'owner/repo' }
  ])('classifies ambiguous source %p as unknown', source => {
    expect(classifyServiceSource(source)).toBe('unknown')
  })
})
