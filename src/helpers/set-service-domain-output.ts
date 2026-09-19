import * as core from '@actions/core'
import { getDomains } from '../services/domains/get-domains'

type SetServiceDomainOutput = {
  environmentId: string
  projectId: string
  serviceId: string
}

export const setServiceDomainOutput = async ({
  environmentId,
  projectId,
  serviceId
}: SetServiceDomainOutput): Promise<void> => {
  const domains = await getDomains({
    environmentId,
    projectId,
    serviceId
  })
  const domain = domains.serviceDomains[0]?.domain

  if (!domain) {
    throw new Error(`No Railway service domain found for service ${serviceId}`)
  }

  core.info(`Service domain: ${domain}`)
  core.setOutput('service_domain', domain)
}
