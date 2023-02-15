export const stepData = [
    {
        heading: "First, let's start with a clear name",
        content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
        progress: 0,
    },
    {
        heading: "Great! What industry does your project fall under?",
        content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
        progress: 0.5,
    },
    {
        heading: "Describe the project you are envisioning.",
        content: `This is how imbuers figure out what you need and why you’re great to work with!
    Include your expectations about the task or deliverable, what you’re looking for in a work relationship, and anything unique about your project, team, or company.`,
        next: "Skills",
        progress: 0.5,
    },
    {
        heading: "What skills do you require?",
        content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
        next: "Skills",
        progress: 1.0,
    },
    {
        heading: "Experience?",
        content: `This is how imbuers figure out who should apply to this brief! 
    The more experienced they are the bigger you should set your budget`,
        next: "Scope",
        progress: 0.5,
    },
    {
        heading: "Next, estimate the scope of your project.",
        content: `Consider the size of your project, the team you will require and the time it will take.`,
        next: "Time",
        progress: 2.0,
    },
    {
        heading: "How long do you estimate your project will take?",
        content: `This is not set in stone, but it will offer those that submit guidance on what you are expecting.`,
        next: "Budget",
        progress: 2.5,
    },
    {
        heading: "Almost done! Tell us about the budget you have in mind.",
        content:
            "This will help people submit proposals that are within your range.",
        progress: 3.0,
    },
    {
        heading: "That's It. All done!",
        content:
            "Your brief will be listed shortly after submission and people will be able to submit proposals for you to review.",
        progress: 3.0,
    },
];

export const nameExamples = [
    "Build a dapp",
    "Write a smart contract",
    "Generate Content, e.g. blog, videos",
];

export const scopeData = [
  {
    label: "Complex",
    value: 4,
    description:
      "A long term project with complex initiatives, intersecting tasks and numerous teams.",
  },
  {
    label: "Large",
    value: 3,
    description:
      "A long term project with multiple tasks and requirements, with well defined milestones and a set plan",
  },
  {
    label: "Medium",
    value: 2,
    description: "A well-defined project, with tasks already mapped out",
  },
  {
    label: "Small",
    value: 1,
    description: "A relatively fast and straightforward project",
  },
];

export const timeData = [
  {
    label: "More than a year",
    value: 4,
  },
  {
    label: "More than 6 months",
    value: 3,
  },
  {
    label: "3-6 months",
    value: 2,
  },
  {
    label: "1 to 3 months",
    value: 1,
  },
];

export const experiencedLevel = [
  {
    label: "Entry Level",
    value: 1,
  },
  {
    label: "Intermediate",
    value: 2,
  },
  {
    label: "Expert",
    value: 3,
  },
  {
    label: "Specialist",
    value: 4,
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

export const suggestedSkills = [
    "Substrate",
    "Rust",
    "Polkadot",
    "Kusama",
    "React",
    "Typescript",
];
