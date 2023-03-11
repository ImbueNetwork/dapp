export enum Currency {
    IMBU = 0,
    KSM = 1,
    AUSD = 2,
    KAR = 3,
    MGX = 4,
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
    milestones: Milestone[];
    owner?: string;
    user_id?: string | number;
    brief_id?: string | number;
    total_cost_without_fee?:  number;
    imbue_fee?:  number;
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
    project_id: number;
    milestone_key: number;
    name: string;
    percentage_to_unlock: number;
    isApproved: boolean;
    amount: number;
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
    username: string;
    password?: string;
    getstream_token: string;
};

export interface BasicTxResponse {
    errorMessage: string | null;
    callHash?: string;
    status?: boolean;
    transactionHash?: string;
    txError?: boolean;
}

export type Freelancer = {
    id: string | number;
    bio: string;
    education: string;
    experience: string;
    facebook_link: string;
    twitter_link: string;
    telegram_link: string;
    discord_link: string;
    freelanced_before: string;
    freelancing_goal: string;
    work_type: string;
    title: string;
    skills: Item[];
    languages: Item[];
    services: Item[];
    clients: Item[];
    client_images: string[];
    display_name: string;
    username: string;
    user_id: number;
    rating?: number;
    num_ratings: number;
    profileImageUrl: string;
};

export function getDefaultFreelancer(): Freelancer {
    return {
        id: 0,
        bio: "",
        education: "",
        experience: "",
        facebook_link: "",
        twitter_link: "",
        telegram_link: "",
        discord_link: "",
        freelanced_before: "",
        freelancing_goal: "",
        work_type: "",
        title: "",
        skills: [],
        languages: [],
        services: [],
        clients: [],
        client_images: [],
        display_name: "default_name",
        username: "default",
        user_id:0,
        rating: 3,
        num_ratings:0,
        profileImageUrl:"default",
    }
}

export type Item = {
    id: number;
    name: string;
}

// The same as backend/briefs
export type Brief = {
    id?: string | number;
    headline: string;
    industries: Item[];
    description: string;
    skills: Item[];
    scope_id: number;
    scope_level: string;
    duration: string;
    duration_id: number;
    budget: number;
    created: Date;
    created_by: string;
    experience_level: string;
    experience_id: number;
    number_of_briefs_submitted: number;
    user_id: number;
};

export type BriefSqlFilter = {
    experience_range: Array<number>;
    submitted_range: Array<number>;
    submitted_is_max: boolean;
    length_range: Array<number>;
    length_is_max: boolean;
    search_input: string;
};

export type FreelancerSqlFilter = {
    skills_range: Array<number>;
    services_range: Array<number>;
    languages_range: Array<number>;
    search_input: string;
};
