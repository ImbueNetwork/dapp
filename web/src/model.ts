export type Project = {
    id: number;
    name: string;
    logo: string;
    description: string;
    website: string;
    status: string;
    required_funds: number;
    owner: string;
    usr_id: number;
    create_block_number?: number;
    category: string | number;
    created: string;
    modified: string;
    milestones: Milestone[];
}
export type Milestone = ProposedMilestone & {
    milestone_index?: number;
    project_id?: number;
    is_approved?: boolean;
    created?: string;
    modified?: string;
};

export type ProposedMilestone = {
    name: string;
    percentage_to_unlock: number;
}
export type GrantProposal = {
    name: string;
    logo: string;
    description: string;
    website: string;
    milestones: ProposedMilestone[];
    required_funds: number;
    // FIXME: `account` should not be optional
    owner?: string;
    usr_id?: number;
    category?: string | number;
};

export type Web3Account = {
    address: string;
};

export type User = {
    id: number;
    web3Accounts: Web3Account[];
};
