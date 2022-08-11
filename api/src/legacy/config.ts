export const appName = "Imbue Network";

/**
 * XXX: we get webSocketAddr from /api/v1/info now.
 */
// const webSocketAddr = "ws://127.0.0.1:8081/wsapp/";
// export const webSocketAddr = "wss://testnet.imbue.network";
// http://3.9.171.186:3000/?rpc=ws%3A%2F%2F3.9.171.186%3A9942#/chainstate
// export const webSocketAddr = "ws://3.9.171.186:9944";
// export const webSocketAddr = "ws://127.0.0.1:9944";

export const context = "/dapp";
export const apiBase = "/api/v1";
export const getAPIHeaders = {
    "accept": "application/json",
};
export const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export const grantProposalsURL = "/proposals";
export const dashboardUrl = "/dashboard";

export const googleAuthEndpoint = "/auth/oauth2/accounts.google.com/login";

export const proposalsDraftLocalDraftKey = "imbu-proposals-draft:local-draft";

/**
 * Event names to be used sort of globally.
 */
export const event = {
    authenticationRequired: "imbu:dapp:authentication-required",
    notification: "imbu:dapp:dialog:create",
    badRoute: "imbu:dapp:bad-route",
    accountChoice: "imbu:dapp:account-choice",
    proposalUpdated: "imbu:dapp:user-proposal-updated"
}

/**
 * https://www.hachettebookgroup.com/travel/trip-ideas/types-of-volunteer-opportunities/
 * https://sbg.sg/business_category_list.pdf
 */
export const categories = {
    "Automative": [
        "Auto Accessories",
        "Auto Dealers - New",
        "Auto Dealers - Used",
        "Detail and Carwash",
        "Gas Stations",
        "Motorcycle Sales and Repair",
        "Rental and Leasing",
        "Service, Repair and Parts",
        "Towing"
    ],
    "Agriculture": [
        "Agricultural work might be on a rural community farming or permaculture project. The best of these projects include local outreach— such as demonstration farms and educational workshops in schools—that support a community-wide change in thinking about agriculture.",
    ],
    "Business Support and Supplies": [
        "Consultants",
        "Employment Agency",
        "Marketing and Communications",
        "Office Supplies",
        "Printing and Publishing",
    ],
    "Children and Youth": [
        "Volunteers might work with kids at an orphanage or nursery, tutor teens in English or math, or organize sports activities for at-risk youth. The most effective child care centers are those that provide a quality education that prepares the children and youth for an economically viable future, and engaging alternatives to the temptations of drugs and gangs.",
    ],
    "Community Development": [
        "This broad category includes everything from installing solar panels at a health clinic or water catchment systems at a school and training firefighters in emergency response to supporting the administration of microcredit programs. For those who prefer a tangible sign of progress, projects in the area of construction—from installing a better stove to building a house—may be especially satisfying.",
    ],
    "Computers and Electronics": [
        "Computer Programming and Support",
        "Consumer Electronics and Accessories",
    ],
    "Construction and Contractors": [
        "Architects, Landscape Architects, Engineers and Surveyors",
        "Blasting and Demolition",
        "Building Materials and Supplies",
        "Construction Companies",
        "Electricians",
        "Engineer, Survey",
        "Environmental Assessments",
        "Inspectors",
        "Plaster and Concrete",
        "Plumbers",
        "Roofers",
    ],
    "Education": [
        "Adult and Continuing Education",
        "Early Childhood Education",
        "Educational Resources",
        "Other Educational",
    ],
    "Entertainment": [
        "Artists, Writers",
        "Event Planners and Supplies",
        "Golf Courses",
        "Movies",
        "Productions",
    ],
    "Environment": [
        "Environmental projects may have volunteers working in an office preparing educational materials, outside creating trails (or recycling, or picking up trash, or planting and tending flora), or in schools or neighborhood centers providing community outreach. In a context where putting food on the table is a more urgent need than care of the environment for many families, volunteers should look for projects that combine community outreach and education with their efforts and know that their presence can help draw attention to an area that might have been overlooked by the local community in the past.",
    ],
    "Food and Dining": [
        "Desserts, Catering and Supplies",
        "Fast Food and Carry Out",
        "Grocery, Beverage and Tobacco",
        "Restaurants",
    ],
    "Health and Medicine": [
        "Acupuncture",
        "Assisted Living and Home Health Care",
        "Audiologist",
        "Chiropractic",
        "Clinics and Medical Centers",
        "Dental",
        "Diet and Nutrition ",
        "Laboratory, Imaging and Diagnostic",
        "Massage Therapy",
        "Mental Health",
        "Nurse",
        "Optical",
        "Pharmacy, Drug and Vitamin Stores",
        "Physical Therapy",
        "Physicians and Assistants",
        "Podiatry",
        "Social Worker",
        "Animal Hospital",
        "Veterinary and Animal Surgeons",
    ],
    "Home and Garden": [
        "Antiques & Collectibles",
        "Cleaning",
        "Crafts, Hobbies & Sports",
        "Flower Shops",
        "Home Furnishings",
        "Home Goods",
        "Home Improvements & Repairs",
        "Landscape & Lawn Service",
        "Pest Control",
        "Pool Supplies & Service",
        "Security System & Services",
    ],
    "Legal and Financial": [
        "Accountants",
        "Attorneys",
        "Financial Institutions",
        "Financial Services",
        "Insurance",
        "Other Legal",
    ],
    "Manufacturing and Distribution": [
        "Distribution, Import/Export",
        "Manufacturing",
        "Wholesale",
    ],
    "Merchants/Retail": [
        "Cards & Gifts",
        "Clothing & Accessories",
        "Department Stores, Sporting Goods",
        "General",
        "Jewelry",
        "Shoes",
    ],
    "Personal Care and Services": [
        "Animal Care & Supplies",
        "Barber & Beauty Salons",
        "Beauty Supplies",
        "Dry Cleaners & Laundromats",
        "Exercise & Fitness",
        "Massage & Body Works",
        "Nail Salons",
        "Shoe Repairs",
        "Tailors",
    ],
    "Real Estate": [
        "Agencies & Brokerage",
        "Agents & Brokers",
        "Apartment & Home Rental",
        "Mortgage Broker & Lender",
        "Property Management",
        "Title Company",
    ],
    "Travel and Transportation": [
        "Hotel, Motel & Extended Stay",
        "Moving & Storage",
        "Packaging & Shipping",
        "Transportation",
        "Travel & Tourism",
    ],
    "Wildlife Protection": [
        "Volunteers can choose from activities such as protecting turtle hatchlings on their journey from nest to sea, supporting the rehabilitation of injured and trafficked animals, or restoring natural habitats for endangered species. Not all wildlife protection projects allow volunteers to work with their animals; work may instead be focused on the cleaning of cages, restoration of natural habitats, or visual monitoring of animal activity in the wild. Programs that help develop alternative sources of income generation for the community are especially interesting, turning many “wildlife protection” projects into a combination of environment, education, and community development.",
    ],
    "Women's Empowerment": [
        "Volunteer opportunities that focus on women might include promoting associations of artisan weavers or supporting workshops on everything from civil rights to home finances. According to UN Women, “there is a direct link between increased female labor participation and growth,” and World Bank studies demonstrate that women are more likely than men to spend their income on food and education for their children, making investments in women a critical part of development.",
    ],
    "Miscellaneous/Other": [
        "Civic Groups",
        "Funeral Service Providers & Cemetaries",
        "Miscellaneous",
        "Utility Companies",
    ],
};
