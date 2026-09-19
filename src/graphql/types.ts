import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  EnvironmentVariables: { input: any; output: any; }
};

export type AllDomains = {
  __typename?: 'AllDomains';
  customDomains: Array<CustomDomain>;
  serviceDomains: Array<ServiceDomain>;
};

export type CustomDomain = {
  __typename?: 'CustomDomain';
  domain: Scalars['String']['output'];
  environmentId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectId?: Maybe<Scalars['String']['output']>;
  serviceId: Scalars['String']['output'];
  targetPort?: Maybe<Scalars['Int']['output']>;
};

export type Deployment = {
  __typename?: 'Deployment';
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  staticUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type DeploymentTrigger = {
  __typename?: 'DeploymentTrigger';
  baseEnvironmentOverrideId?: Maybe<Scalars['String']['output']>;
  branch: Scalars['String']['output'];
  checkSuites: Scalars['Boolean']['output'];
  environmentId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectId: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  repository: Scalars['String']['output'];
  serviceId?: Maybe<Scalars['String']['output']>;
  validCheckSuites: Scalars['Int']['output'];
};

export type DeploymentTriggerUpdateInput = {
  branch?: InputMaybe<Scalars['String']['input']>;
  checkSuites?: InputMaybe<Scalars['Boolean']['input']>;
  repository?: InputMaybe<Scalars['String']['input']>;
  rootDirectory?: InputMaybe<Scalars['String']['input']>;
};

export type Environment = {
  __typename?: 'Environment';
  createdAt: Scalars['String']['output'];
  deploymentTriggers: EnvironmentDeploymentTriggersConnection;
  deployments: EnvironmentDeploymentsConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  serviceInstances: EnvironmentServiceInstancesConnection;
};

export type EnvironmentCreateInput = {
  ephemeral?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  skipInitialDeploys?: InputMaybe<Scalars['Boolean']['input']>;
  sourceEnvironmentId?: InputMaybe<Scalars['String']['input']>;
  stageInitialChanges?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EnvironmentDeploymentTriggersConnection = {
  __typename?: 'EnvironmentDeploymentTriggersConnection';
  edges: Array<EnvironmentDeploymentTriggersConnectionEdge>;
  pageInfo: PageInfo;
};

export type EnvironmentDeploymentTriggersConnectionEdge = {
  __typename?: 'EnvironmentDeploymentTriggersConnectionEdge';
  cursor: Scalars['String']['output'];
  node: DeploymentTrigger;
};

export type EnvironmentDeploymentsConnection = {
  __typename?: 'EnvironmentDeploymentsConnection';
  edges: Array<EnvironmentDeploymentsConnectionEdge>;
  pageInfo: PageInfo;
};

export type EnvironmentDeploymentsConnectionEdge = {
  __typename?: 'EnvironmentDeploymentsConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Deployment;
};

export type EnvironmentServiceInstancesConnection = {
  __typename?: 'EnvironmentServiceInstancesConnection';
  edges: Array<EnvironmentServiceInstancesConnectionEdge>;
  pageInfo: PageInfo;
};

export type EnvironmentServiceInstancesConnectionEdge = {
  __typename?: 'EnvironmentServiceInstancesConnectionEdge';
  cursor: Scalars['String']['output'];
  node: ServiceInstance;
};

export type Mutation = {
  __typename?: 'Mutation';
  deploymentTriggerUpdate: DeploymentTrigger;
  environmentCreate: Environment;
  environmentDelete: Scalars['Boolean']['output'];
  serviceInstanceDeployV2: Scalars['String']['output'];
  serviceInstanceRedeploy: Scalars['Boolean']['output'];
  variableCollectionUpsert: Scalars['Boolean']['output'];
};


export type MutationDeploymentTriggerUpdateArgs = {
  id: Scalars['String']['input'];
  input: DeploymentTriggerUpdateInput;
};


export type MutationEnvironmentCreateArgs = {
  input: EnvironmentCreateInput;
};


export type MutationEnvironmentDeleteArgs = {
  id: Scalars['String']['input'];
};


export type MutationServiceInstanceDeployV2Args = {
  commitSha?: InputMaybe<Scalars['String']['input']>;
  environmentId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
};


export type MutationServiceInstanceRedeployArgs = {
  environmentId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
};


export type MutationVariableCollectionUpsertArgs = {
  input?: InputMaybe<VariableCollectionUpsertInput>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  deployment: Deployment;
  domains: AllDomains;
  environment?: Maybe<Environment>;
  environments: QueryEnvironmentConnection;
  service: Service;
};


export type QueryDeploymentArgs = {
  id: Scalars['String']['input'];
};


export type QueryDomainsArgs = {
  environmentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
};


export type QueryEnvironmentArgs = {
  id: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEnvironmentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isEphemeral?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['String']['input'];
};


export type QueryServiceArgs = {
  id: Scalars['String']['input'];
};

export type QueryEnvironmentConnection = {
  __typename?: 'QueryEnvironmentConnection';
  edges: Array<QueryEnvironmentConnectionEdge>;
  pageInfo: PageInfo;
};

export type QueryEnvironmentConnectionEdge = {
  __typename?: 'QueryEnvironmentConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Environment;
};

export type Service = {
  __typename?: 'Service';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
};

export type ServiceDomain = {
  __typename?: 'ServiceDomain';
  domain: Scalars['String']['output'];
  environmentId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectId?: Maybe<Scalars['String']['output']>;
  serviceId: Scalars['String']['output'];
  suffix?: Maybe<Scalars['String']['output']>;
  targetPort?: Maybe<Scalars['Int']['output']>;
};

export type ServiceInstance = {
  __typename?: 'ServiceInstance';
  domains: AllDomains;
  id: Scalars['ID']['output'];
  serviceId: Scalars['String']['output'];
  startCommand: Scalars['String']['output'];
};

export type VariableCollectionUpsertInput = {
  environmentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  replace?: InputMaybe<Scalars['Boolean']['input']>;
  serviceId?: InputMaybe<Scalars['String']['input']>;
  variables: Scalars['EnvironmentVariables']['input'];
};

export type CreateEnvironmentMutationVariables = Exact<{
  input: EnvironmentCreateInput;
}>;


export type CreateEnvironmentMutation = { __typename?: 'Mutation', environmentCreate: { __typename?: 'Environment', id: string, name: string, createdAt: string, deploymentTriggers: { __typename?: 'EnvironmentDeploymentTriggersConnection', edges: Array<{ __typename?: 'EnvironmentDeploymentTriggersConnectionEdge', node: { __typename?: 'DeploymentTrigger', id: string, environmentId: string, branch: string, projectId: string } }> }, serviceInstances: { __typename?: 'EnvironmentServiceInstancesConnection', edges: Array<{ __typename?: 'EnvironmentServiceInstancesConnectionEdge', node: { __typename?: 'ServiceInstance', id: string, serviceId: string, domains: { __typename?: 'AllDomains', serviceDomains: Array<{ __typename?: 'ServiceDomain', domain: string, id: string }> } } }> } } };

export type DeleteEnvironmentMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteEnvironmentMutation = { __typename?: 'Mutation', environmentDelete: boolean };

export type DeploymentTriggerUpdateMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: DeploymentTriggerUpdateInput;
}>;


export type DeploymentTriggerUpdateMutation = { __typename?: 'Mutation', deploymentTriggerUpdate: { __typename?: 'DeploymentTrigger', id: string } };

export type ServiceInstanceDeployV2MutationVariables = Exact<{
  commitSha: Scalars['String']['input'];
  environmentId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
}>;


export type ServiceInstanceDeployV2Mutation = { __typename?: 'Mutation', serviceInstanceDeployV2: string };

export type ServiceInstanceRedeployMutationVariables = Exact<{
  environmentId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
}>;


export type ServiceInstanceRedeployMutation = { __typename?: 'Mutation', serviceInstanceRedeploy: boolean };

export type VariableCollectionUpsertMutationVariables = Exact<{
  input: VariableCollectionUpsertInput;
}>;


export type VariableCollectionUpsertMutation = { __typename?: 'Mutation', variableCollectionUpsert: boolean };

export type GetDeploymentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetDeploymentQuery = { __typename?: 'Query', deployment: { __typename?: 'Deployment', id: string, status: string, createdAt?: string | null, staticUrl?: string | null, url?: string | null } };

export type GetDomainsQueryVariables = Exact<{
  environmentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  serviceId: Scalars['String']['input'];
}>;


export type GetDomainsQuery = { __typename?: 'Query', domains: { __typename?: 'AllDomains', serviceDomains: Array<{ __typename?: 'ServiceDomain', id: string, domain: string, suffix?: string | null, targetPort?: number | null }>, customDomains: Array<{ __typename?: 'CustomDomain', id: string, domain: string, targetPort?: number | null }> } };

export type GetEnvironmentQueryVariables = Exact<{
  id: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetEnvironmentQuery = { __typename?: 'Query', environment?: { __typename?: 'Environment', id: string, name: string, projectId: string, deploymentTriggers: { __typename?: 'EnvironmentDeploymentTriggersConnection', edges: Array<{ __typename?: 'EnvironmentDeploymentTriggersConnectionEdge', node: { __typename?: 'DeploymentTrigger', id: string, environmentId: string, branch: string, projectId: string } }> }, serviceInstances: { __typename?: 'EnvironmentServiceInstancesConnection', edges: Array<{ __typename?: 'EnvironmentServiceInstancesConnectionEdge', node: { __typename?: 'ServiceInstance', id: string, serviceId: string, domains: { __typename?: 'AllDomains', serviceDomains: Array<{ __typename?: 'ServiceDomain', domain: string, id: string }> } } }> } } | null };

export type GetEnvironmentsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['String']['input'];
}>;


export type GetEnvironmentsQuery = { __typename?: 'Query', environments: { __typename?: 'QueryEnvironmentConnection', edges: Array<{ __typename?: 'QueryEnvironmentConnectionEdge', node: { __typename?: 'Environment', id: string, name: string, projectId: string } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type GetServiceQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetServiceQuery = { __typename?: 'Query', service: { __typename?: 'Service', name: string } };


export const CreateEnvironmentDocument = gql`
    mutation CreateEnvironment($input: EnvironmentCreateInput!) {
  environmentCreate(input: $input) {
    id
    name
    createdAt
    deploymentTriggers {
      edges {
        node {
          id
          environmentId
          branch
          projectId
        }
      }
    }
    serviceInstances {
      edges {
        node {
          id
          domains {
            serviceDomains {
              domain
              id
            }
          }
          serviceId
        }
      }
    }
  }
}
    `;
export const DeleteEnvironmentDocument = gql`
    mutation DeleteEnvironment($id: String!) {
  environmentDelete(id: $id)
}
    `;
export const DeploymentTriggerUpdateDocument = gql`
    mutation DeploymentTriggerUpdate($id: String!, $input: DeploymentTriggerUpdateInput!) {
  deploymentTriggerUpdate(id: $id, input: $input) {
    id
  }
}
    `;
export const ServiceInstanceDeployV2Document = gql`
    mutation ServiceInstanceDeployV2($commitSha: String!, $environmentId: String!, $serviceId: String!) {
  serviceInstanceDeployV2(
    commitSha: $commitSha
    environmentId: $environmentId
    serviceId: $serviceId
  )
}
    `;
export const ServiceInstanceRedeployDocument = gql`
    mutation ServiceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
  serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
}
    `;
export const VariableCollectionUpsertDocument = gql`
    mutation VariableCollectionUpsert($input: VariableCollectionUpsertInput!) {
  variableCollectionUpsert(input: $input)
}
    `;
export const GetDeploymentDocument = gql`
    query GetDeployment($id: String!) {
  deployment(id: $id) {
    id
    status
    createdAt
    staticUrl
    url
  }
}
    `;
export const GetDomainsDocument = gql`
    query GetDomains($environmentId: String!, $projectId: String!, $serviceId: String!) {
  domains(
    environmentId: $environmentId
    projectId: $projectId
    serviceId: $serviceId
  ) {
    serviceDomains {
      id
      domain
      suffix
      targetPort
    }
    customDomains {
      id
      domain
      targetPort
    }
  }
}
    `;
export const GetEnvironmentDocument = gql`
    query GetEnvironment($id: String!, $projectId: String) {
  environment(id: $id, projectId: $projectId) {
    id
    name
    projectId
    deploymentTriggers {
      edges {
        node {
          id
          environmentId
          branch
          projectId
        }
      }
    }
    serviceInstances {
      edges {
        node {
          id
          domains {
            serviceDomains {
              domain
              id
            }
          }
          serviceId
        }
      }
    }
  }
}
    `;
export const GetEnvironmentsDocument = gql`
    query GetEnvironments($after: String, $first: Int, $projectId: String!) {
  environments(after: $after, first: $first, projectId: $projectId) {
    edges {
      node {
        id
        name
        projectId
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;
export const GetServiceDocument = gql`
    query GetService($id: String!) {
  service(id: $id) {
    name
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    CreateEnvironment(variables: CreateEnvironmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateEnvironmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateEnvironmentMutation>(CreateEnvironmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateEnvironment', 'mutation', variables);
    },
    DeleteEnvironment(variables: DeleteEnvironmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteEnvironmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteEnvironmentMutation>(DeleteEnvironmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DeleteEnvironment', 'mutation', variables);
    },
    DeploymentTriggerUpdate(variables: DeploymentTriggerUpdateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeploymentTriggerUpdateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeploymentTriggerUpdateMutation>(DeploymentTriggerUpdateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DeploymentTriggerUpdate', 'mutation', variables);
    },
    ServiceInstanceDeployV2(variables: ServiceInstanceDeployV2MutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ServiceInstanceDeployV2Mutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ServiceInstanceDeployV2Mutation>(ServiceInstanceDeployV2Document, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ServiceInstanceDeployV2', 'mutation', variables);
    },
    ServiceInstanceRedeploy(variables: ServiceInstanceRedeployMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ServiceInstanceRedeployMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ServiceInstanceRedeployMutation>(ServiceInstanceRedeployDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ServiceInstanceRedeploy', 'mutation', variables);
    },
    VariableCollectionUpsert(variables: VariableCollectionUpsertMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VariableCollectionUpsertMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VariableCollectionUpsertMutation>(VariableCollectionUpsertDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'VariableCollectionUpsert', 'mutation', variables);
    },
    GetDeployment(variables: GetDeploymentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDeploymentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDeploymentQuery>(GetDeploymentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDeployment', 'query', variables);
    },
    GetDomains(variables: GetDomainsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDomainsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDomainsQuery>(GetDomainsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDomains', 'query', variables);
    },
    GetEnvironment(variables: GetEnvironmentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetEnvironmentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEnvironmentQuery>(GetEnvironmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEnvironment', 'query', variables);
    },
    GetEnvironments(variables: GetEnvironmentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetEnvironmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEnvironmentsQuery>(GetEnvironmentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEnvironments', 'query', variables);
    },
    GetService(variables: GetServiceQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetServiceQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetServiceQuery>(GetServiceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetService', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;