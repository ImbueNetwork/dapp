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

export type BriefProps = {};

export type BriefState = {
    briefs: Array<BriefItem>;
};

export class Briefs extends React.Component<BriefProps, BriefState> {
    filters = [
        {
            label: "Experience Level",
            options: [
                {
                    key: "entry",
                    value: "Entry Level",
                },
                {
                    key: "intermediate",
                    value: "Intermediate",
                },
                {
                    key: "expert",
                    value: "Expert",
                },
                {
                    key: "specialist",
                    value: "Specialist",
                },
            ],
        },
        {
            label: "Proposals submitted",
            options: [
                {
                    key: "<5",
                    value: "Less than 5",
                },
                {
                    key: "5-10",
                    value: "5 to 10",
                },
                {
                    key: "10-15",
                    value: "10 to 15",
                },
                {
                    key: "15+",
                    value: "15+",
                },
            ],
        },
        {
            label: "Project Length",
            options: [
                {
                    key: "1m",
                    value: "One month",
                },
                {
                    key: "1-3m",
                    value: "1-3 months",
                },
                {
                    key: "6-12m",
                    value: "6-12 months",
                },
                {
                    key: "1y+",
                    value: "1 year +",
                },
                {
                    key: "5y+",
                    value: "5 years +",
                },
            ],
        },
        {
            label: "Hours per week",
            options: [
                {
                    key: "30hrs",
                    value: "30hrs/week",
                },
                {
                    key: "50hrs",
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

    onSearch = () => {};

    onSavedBriefs = () => {};

    render() {
        return (
            <div className="search-briefs-container">
                <div className="filter-panel">
                    <div className="filter-heading">Filter By</div>
                    {this.filters.map(({ label, options }, filterIndex) => (
                        <div className="filter-section" key={filterIndex}>
                            <div className="filter-label">{label}</div>
                            <div className="filter-option-list">
                                {options.map(({ key, value }, optionIndex) => (
                                    <div
                                        className="filter-option"
                                        key={optionIndex}
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
