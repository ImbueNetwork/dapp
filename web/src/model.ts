import * as config from "./config";

export type DraftMilestone = {
    name: string;
    percentage_to_unlock: number;
}
export type DraftProposal = {
    name: string;
    logo: string;
    description: string;
    website: string;
    milestones: DraftMilestone[];
    required_funds: number;
    owner: string;
    usr_id?: number;
    category?: string | number;
};

export type Proposal = DraftProposal & {
    id: number;
    status: string;
    usr_id: number;
    create_block_number?: number;
    created: string;
    modified: string;
    milestones: Milestone[];
}

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

export const postGrantProposal = (
    proposal: DraftProposal
) => fetch(`${config.apiBase}/projects/`, {
    method: "post",
    headers: config.postAPIHeaders,
    body: JSON.stringify({proposal})
});

export const updateGrantProposal = (
    proposal: DraftProposal,
    id: string | number
) => fetch(`${config.apiBase}/projects/${id}`, {
    method: "put",
    headers: config.postAPIHeaders,
    body: JSON.stringify({proposal})
});

export const fetchProject = (projectId: string) => fetch(
    `${config.apiBase}/projects/${projectId}`,
    {headers: config.getAPIHeaders}
);
