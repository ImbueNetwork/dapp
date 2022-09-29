export enum Currency {
    IMBU = "IMBU",
    KSM = "KSM",
    KUSD = "KUSD"
}

export enum RoundType {
    ContributionRound,
    VotingRound,
}

export enum ButtonState {
    Default,
    Saving,
    Done
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

    cancelled: boolean;
    projectState: ProjectState;
}

export type Milestone = {
    projectKey: number;
    milestoneKey: number;
    name: string;
    percentageToUnlock: number;
    isApproved: boolean;
}

export type Contribution = {
    accountId: string;
    value: bigint;
}

export type Web3Account = {
    address: string,
    user_id: number;
    type: string;
    challenge: string;
};

export type User = {
    id: number;
    display_name: string;
    web3Accounts: Web3Account[];
};

export interface BasicTxResponse {
    errorMessage: string | null,
    callHash?: string,
    status?: boolean,
    transactionHash?: string,
    txError?: boolean,
  }