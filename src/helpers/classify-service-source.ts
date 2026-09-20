import type { ServiceSource } from '../graphql/types'

export type ServiceSourceKind = 'repository' | 'image' | 'unknown'

export const classifyServiceSource = (
  source?: ServiceSource | null
): ServiceSourceKind => {
  const hasImage = Boolean(source?.image)
  const hasRepository = Boolean(source?.repo)

  if (hasImage === hasRepository) {
    return 'unknown'
  }

  return hasImage ? 'image' : 'repository'
}
