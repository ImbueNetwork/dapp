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
import e from "express";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

type Range = {
    low: number,
    high: number,
}

type BriefFilter = {
    experience_id: Range,
    hours_pw: number
    submitted_briefs: Range,
    brief_length: Range,
}

type BriefItem = {
    title: string;
    xpLevel: string;
    length: string;
    posted: string;
    description: string;
    tags: string[];
    proposals: string;
};


const callSearchBriefs = async (filter: BriefFilter) => {
    const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify(filter),
    });

    if (resp.ok) {
        return await resp.json() as Array<BriefItem>
    } else {
        throw new Error('Failed to search briefs. status:' + resp.status);
    }
  }

  const getAllBriefs = async () => {
    const resp =  await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json() as Array<BriefItem>
    } else {
        throw new Error('Failed to get all briefs. status:' + resp.status);
    }
  }

export type BriefProps = {};


export type BriefState = {
    briefs: Array<BriefItem>;
};


export enum BriefFilterOption {
    ExpLevel = 0,
    AmountSubmitted = 1,
    Length = 2,
    HoursPerWeek = 3,
};


export class Briefs extends React.Component<BriefProps, BriefState> {

    // IF YOU REORDER THESE IT WILL BREAK.
    // to add a new filter add to the enum BriefFilterOption, add to the bottom of the list with the correct index
    filters = [
        {
            // Keys should never be strings, strings are slow. 
            // I can read and match agains enums, much easier.
            // This is a table named "experience"
            // If you change this you must remigrate the experience table and add the new field.
            filterType: BriefFilterOption.ExpLevel,
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
            filterType: BriefFilterOption.AmountSubmitted,
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
            filterType: BriefFilterOption.Length,
            label: "Project Length",
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
            filterType: BriefFilterOption.HoursPerWeek,
            label: "Hours Per Week",
            options: [
                {
                    interiorIndex: 0,
                    low: 0,
                    high: 30,
                    value: "30hrs/week",
                },
                {
                    low: 0,
                    high: 50,
                    interiorIndex: 1,
                    value: "50hrs/week",
                },
            ],
        },
    ];
    
    constructor(props: BriefProps) {
        super(props);
        getAllBriefs().then((briefs) => {
            this.setState({ briefs: briefs });
          });
    }

    // Here we have to get all the checked boxes and try and construct a query out of it...
    onSearch = () => {
        let elements = document.getElementsByClassName("filtercheckbox") as HTMLCollectionOf<HTMLInputElement>;
    
        // The filter initially should return all values
        let filter: BriefFilter = {
            experience_id: {low: 0, high: 0},
            hours_pw: 0,
            submitted_briefs: {low: 0, high: 0},
            brief_length: {low: 0, high: 0},
        };
        let is_search: boolean = false;

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                is_search = true
                let id = elements[i].getAttribute("id");
                if (id != null) {
                    let [filterType, interiorIndex] = id.split("-");
                    let filter_index = parseInt(filterType)
                    // Here we are trying to build teh paramaters required to buidl the
                    // model searchBriefs
                    //let current_data =  this.filters.filter()
                    switch(parseInt(filterType)) {
                        case BriefFilterOption.ExpLevel:
                            // get lowest an highes where 

                        case BriefFilterOption.AmountSubmitted:
                        
                        case BriefFilterOption.Length:
                        
                        case BriefFilterOption.HoursPerWeek:
                        
                        default:
                            console.log("Invalid filter option selected or unimplemented.");
                    }
                }
            }
        }

        // Search briefs
        //update state with new list.
    };

    onSavedBriefs = () => {

    };

    render() {
        return (
            <div className="search-briefs-container">
                <div className="filter-panel">
                    <div className="filter-heading">Filter By</div>
                    {this.filters.map(({ label, options, filterType }) => (
                        <div className="filter-section" key={filterType}>
                            <div className="filter-label">{label}</div>
                            <div className="filter-option-list">
                                {options.map(({value, interiorIndex}) => (
                                    <div
                                        className="filter-option"
                                        key={interiorIndex}
                                    >
                                        <input type="checkbox" className="filtercheckbox" id={filterType.toString() + "-" + interiorIndex} />
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
