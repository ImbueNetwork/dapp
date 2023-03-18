import * as config from "./config";

export enum Currency {
  IMBU,
  KSM,
  AUSD,
  KAR,
  MGX,
}

export enum RoundType {
  ContributionRound,
  VotingRound,
}

/**
 * Models the milestone data that appears in the /proposals/draft form
 */
export type DraftMilestone = {
  name: string;
  percentage_to_unlock: number;
};
/**
 * Models the data from inputs that appears in the /proposals/draft form
 */
export type DraftProposal = {
  name: string;
  logo: string;
  description: string;
  website: string;
  milestones: DraftMilestone[];
  required_funds: number;
  currency_id: number;
  owner: string;
  user_id?: number;
  chain_project_id?: number;
  category?: string | number;
};

/**
 * Models a "project" saved to the db, but not on chain.
 */
export type Proposal = DraftProposal & {
  id: number;
  status: string;
  user_id: number;
  create_block_number?: number;
  created: string;
  modified: string;
  milestones: Milestone[];
};

/**
 * Models a "milestone" saved to the db (and also as it will appear on chain).
 */
export type Milestone = DraftMilestone & {
  milestone_index?: number;
  project_id: number;
  is_approved: boolean;
  created: string;
  modified: string;
};

export type Web3Account = {
  address: string;
};

export type User = {
  id: number;
  web3Accounts: Web3Account[];
};

/**
 * CRUD Methods
 */

export const postDraftProposal = (proposal: DraftProposal) =>
  fetch(`${config.apiBase}/projects/`, {
    method: "post",
    headers: config.postAPIHeaders,
    body: JSON.stringify({ proposal }),
  });

export const updateProposal = (proposal: DraftProposal, id: string | number) =>
  fetch(`${config.apiBase}/projects/${id}`, {
    method: "put",
    headers: config.postAPIHeaders,
    body: JSON.stringify({ proposal }),
  });

export const fetchProject = (projectId: string) =>
  fetch(`${config.apiBase}/projects/${projectId}`, {
    headers: config.getAPIHeaders,
  });

/**
 * FIXME: configurable limit, filters, pagination, etc.
 */
export const fetchProjects = () =>
  fetch(`${config.apiBase}/projects/`, { headers: config.getAPIHeaders });

export const fetchUserProject = (userId: number) =>
  fetch(`${config.apiBase}/users/${userId}/project/`, {
    headers: config.getAPIHeaders,
  });
