export enum Currency {
    IMBU = "IMBU",
    KSM = "KSM",
    AUSD = "AUSD",
    KAR = "KAR",
    MGX = "MGX",
}

export enum RoundType {
    ContributionRound,
    VotingRound,
}

export enum ButtonState {
    Default,
    Saving,
    Done,
}

export type Project = {
    id?: string | number;
    name: string;
    logo: string;
    description: string;
    website: string;
    category?: string | number;
    chain_project_id?: number;
    required_funds: number;
    currency_id: number;
    owner?: string;
    user_id?: string | number;
};

export enum ProjectState {
    PendingProjectApproval,
    PendingFundingApproval,
    OpenForContribution,
    PendingMilestoneSubmission,
    PendingMilestoneApproval,
    OpenForVoting,
    OpenForWithdraw,
}

export type ProjectOnChain = {
    id?: string | number;
    name: string;
    logo: string;
    description: string;
    website: string;
    requiredFunds: bigint;
    requiredFundsFormatted: number;
    raisedFunds: bigint;
    raisedFundsFormatted: number;
    withdrawnFunds: bigint;
    currencyId: Currency;
    milestones: Milestone[];
    contributions: Contribution[];
    initiator: string;
    createBlockNumber: bigint;
    approvedForFunding: boolean;
    fundingThresholdMet: boolean;
    roundKey: number | undefined;
    cancelled: boolean;
    projectState: ProjectState;
};

export type Milestone = {
    projectKey: number;
    milestoneKey: number;
    name: string;
    percentageToUnlock: number;
    isApproved: boolean;
};

export type Contribution = {
    accountId: string;
    value: bigint;
    timestamp: bigint;
};

export type Web3Account = {
    address: string;
    user_id: number;
    type: string;
    challenge: string;
};

export type User = {
    id: number;
    display_name: string;
    web3Accounts: Web3Account[];
    username?: string;
    password?: string;
};

export interface BasicTxResponse {
    errorMessage: string | null;
    callHash?: string;
    status?: boolean;
    transactionHash?: string;
    txError?: boolean;
}

export type Freelancer = {
    id?: string | number;
    education: string;
    experience: string;
    freelanced_before: string;
    work_type: string;
    skills: string[];
    title: string;
    languages: string[];
    services_offer: string[];
    bio: string;
    user_id?: number;
};