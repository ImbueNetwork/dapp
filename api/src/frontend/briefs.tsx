import { timeStamp } from "console";
import React from "react";
import ReactDOMClient from "react-dom/client";
import { Option } from "./components/option";
import { ProgressBar } from "./components/progressBar";
import { TagsInput } from "./components/tagsInput";
import { TextInput } from "./components/textInput";
import {
    stepData,
    scopeData,
    timeData,
    nameExamples,
    suggestedIndustries,
    suggestedSkills,
} from "./config/briefs-data";
import * as config from "./config";
import { lchown } from "fs";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

type FilterOption = {
    key: string;
    value: string;
};

type Filter = {
    experience: string;
    proposals: string;
    length: string;
    hours: string;
};

type BriefItem = {
    title: string;
    xpLevel: string;
    length: string;
    posted: string;
    description: string;
    tags: string[];
    proposals: string;
};

export enum BriefFilterOption {
    ExpLevel = 0,
    AmountSubmitted = 1,
    Length = 2,
    HoursPerWeek = 3,

};


export type BriefProps = {};

export type BriefState = {
    briefs: Array<BriefItem>;
};


export class Briefs extends React.Component<BriefProps, BriefState> {
    
    filters = [
        {
            // Keys should never be strings, strings are slow. 
            // I can read and match agains enums, much easier.
            // This is a table named "experience"
            // If you change this you must remigrate the experience table.
            object: BriefFilterOption.ExpLevel,
            label: "Experience Level",
            options: [
                {
                    interiorIndex: 0,
                    value: "Entry Level",
                },
                {
                    interiorIndex: 1,
                    value: "Intermediate",
                },
                {
                    interiorIndex: 2,
                    value: "Expert",
                },
                {
                    interiorIndex: 3,
                    value: "Specialist",
                },
            ],
        },
        {
            // This is a field associated with the User.
            // since its a range i need the 
            object: BriefFilterOption.AmountSubmitted,
            label: "Briefs Submitted",
            options: [
                {
                    interiorIndex: 0,
                    low: 0,
                    high: 4,
                    value: "0-4",
                },
                {
                    interiorIndex: 1,
                    low: 5,
                    high: 9,
                    value: "5-9",
                },
                {
                    interiorIndex: 2,
                    low: 10,
                    high: 14,
                    value: "10-14",
                },
                {
                    interiorIndex: 3,
                    low: 15,
                    high: 100000,
                    value: "15+",
                },
            ],
        },
        {
            // Should be a field in the database, WILL BE IN DAYS.
            // Again i need the high and low values.
            object: BriefFilterOption.Length,
            label: BriefFilterOption.Length,
            options: [
                {
                    interiorIndex: 0,
                    low: 0,
                    high: 28,
                    value: "1 month"
                },
                {
                    interiorIndex: 1,
                    low: 29,
                    high: 28 * 3,
                    value: "1-3 months",
                },
                {
                    interiorIndex: 2,
                    low: (3 * 28) + 1,
                    high: 28 * 6,
                    value: "3-6 months",
                },
                {
                    interiorIndex: 3,
                    low: (6 * 28) + 1,
                    high: 12 * 28,
                    value: "6-12 months",
                },
                {
                    interiorIndex: 4,
                    low: (12 * 28) + 1,
                    high: 10_000_000,
                    value: "1 year +",
                },
                {
                    // years * months * days
                    interiorIndex: 5,
                    low: (5 * 12 * 28),
                    high: 10_000_000,
                    value: "5 years +",
                },
            ],
        },
        {
            label: BriefFilterOption.HoursPerWeek,
            options: [
                {
                    interiorIndex: 0,
                    value: "30hrs/week",
                },
                {
                    interiorIndex: 1,
                    value: "50hrs/week",
                },
            ],
        },
    ];
    state: BriefState = {
        briefs: [
            {
                title: "Product Development Engineer",
                xpLevel: "Intermediate",
                length: "More than 6 months",
                posted: "5 days ago",
                description:
                    "Looking to build a team of product developers who have experience building products in the healthcare industry",
                tags: ["Product Development", "Health", "Wellness"],
                proposals: "Less than 5",
            },
            {
                title: "Product Development Engineer",
                xpLevel: "Intermediate",
                length: "More than 6 months",
                posted: "5 days ago",
                description:
                    "Looking to build a team of product developers who have experience building products in the healthcare industry",
                tags: ["Product Development", "Health", "Wellness"],
                proposals: "Less than 5",
            },
            {
                title: "Product Development Engineer",
                xpLevel: "Intermediate",
                length: "More than 6 months",
                posted: "5 days ago",
                description:
                    "Looking to build a team of product developers who have experience building products in the healthcare industry",
                tags: ["Product Development", "Health", "Wellness"],
                proposals: "Less than 5",
            },
            {
                title: "Product Development Engineer",
                xpLevel: "Intermediate",
                length: "More than 6 months",
                posted: "5 days ago",
                description:
                    "Looking to build a team of product developers who have experience building products in the healthcare industry",
                tags: ["Product Development", "Health", "Wellness"],
                proposals: "Less than 5",
            },
        ],
    };
    constructor(props: BriefProps) {
        super(props);
    }

    onSearch = () => {
        // get all the checked boxes
        
    };

    onSavedBriefs = () => {

    };

    render() {
        return (
            <div className="search-briefs-container">
                <div className="filter-panel">
                    <div className="filter-heading">Filter By</div>
                    {this.filters.map(({ label, options }, filterIndex) => (
                        <div className="filter-section" key={filterIndex}>
                            <div className="filter-label">{label}</div>
                            <div className="filter-option-list">
                                {options.map(({value, interiorIndex}) => (
                                    <div
                                        className="filter-option"
                                        key={interiorIndex}
                                    >
                                        <input type="checkbox" />
                                        <label>{value}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="briefs-section">
                    <div className="briefs-heading">
                        <div className="tab-section">
                            <div className="tab-item" onClick={this.onSearch}>
                                Search
                            </div>
                            <div
                                className="tab-item"
                                onClick={this.onSavedBriefs}
                            >
                                Saved Briefs
                            </div>
                        </div>
                        <input className="search-input" placeholder="Search" />
                        <div className="search-result">
                            <span className="result-count">34,643</span>
                            <span> briefs found</span>
                        </div>
                    </div>
                    <div className="briefs-list">
                        {this.state.briefs.map((item, itemIndex) => (
                            <div className="brief-item" key={itemIndex}>
                                <div className="brief-title">{item.title}</div>
                                <div className="brief-time-info">
                                    {`${item.xpLevel}, Est. Time: ${item.length}. Posted ${item.posted}`}
                                </div>
                                <div className="brief-description">
                                    {item.description}
                                </div>
                                <div className="brief-tags">
                                    {item.tags.map((tag, tagIndex) => (
                                        <div
                                            className="tag-item"
                                            key={tagIndex}
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                                <div className="brief-proposals">
                                    <span className="proposals-heading">
                                        Proposals Submitted:{" "}
                                    </span>
                                    <span className="proposals-count">
                                        {item.proposals}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById("briefs")!).render(
        <Briefs />
    );
});
