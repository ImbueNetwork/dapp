export const stepData = [
    {
        heading: `Hello {name}, ready to
        find an opportunity?`,
        content: `Answer a few questions and start building your profile
        Apply for open briefs or list your skills for clients to hire
        Get paid safely and securely!`,
        progress: 1,
    },
    {
        heading: "A few quick questions: have you freelanced before?",
        content: `This tells us how much help to give you along the way.
        (We won’t share your answer with anyone else, including potential clients.)`,
        progress: 2,
    },
    {
        heading: "What skills do you require?",
        content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
        next: "Scope",
        progress: 1.0,
    },
];

export const nameExamples = ["Build a dapp", "Write a smart contract", "Generate Content, e.g. blog, videos"];

export const scopeData = [
    {
        label: "Complex",
        value: "complex",
        description:
            "A long term project with complex initiatives,  intersecting tasks and numeroous teams.",
    },
    {
        label: "Large",
        value: "large",
        description:
            "A long term project with multiple tasks and requirements, with well defined milestones and a set plan",
    },
    {
        label: "Medium",
        value: "medium",
        description: "A well-defined project, with tasks already mapped out",
    },
    {
        label: "Small",
        value: "small",
        description: "A relatively fast and straightforward project",
    },
];

export const timeData = [
    {
        label: "More than a year",
        value: "1",
    },
    {
        label: "More than 6 months",
        value: "2",
    },
    {
        label: "3-6 months",
        value: "3",
    },
    {
        label: "1 to 3 months",
        value: "4",
    },
];

export const suggestedIndustries = [
    "Web3",
    "DeFi",
    "Education",
    "Agriculture",
    "Communications",
    "Health",
    "Wellness",
    "Energy",
    "Sustainability",
    "Arts and Culture",
    "Entertainment",
    "Real Estate",
    "Technology",
    "Supply Chain",
];


export const suggestedSkills = ['Substrate', 'Rust', 'Polkadot', 'Kusama', 'React', 'Typescript'];

export const freelancedBeforeStatic = [
    "No this is new to me.",
    "I've freelanced before however, i may need some extra help.",
    "Yes I'm a pro, I've been doing it for years"
]