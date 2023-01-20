import React from "react";
import ReactDOMClient from "react-dom/client";
import * as config from "./config";
import BriefFilter from "./components/briefFilter";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

type BriefItem = {
    headline: string;
    experience_level: string;
    duration: string;
    user: string;
    description: string;
    skills: string;
    briefs_submitted: number;
    created: string;
};

export type FilterOption = {
    interiorIndex: number;
    search_for: Array<number>;
    or_max: boolean;
    value: string;
};


const callSearchBriefs = async (
    experience_range: Array<number>, 
    submitted_range: Array<number>, submitted_is_max: boolean,
    length_range: Array<number>, length_is_max: boolean, 
    max_hours_pw: number, hours_pw_is_max: boolean) => {
    const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({experience_range, submitted_range, submitted_is_max, length_is_max, length_range, max_hours_pw, hours_pw_is_max}),
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


    // The thing with this implentation is that the interior order must stay totally ordered.
    // The interior index is used to specify which entry will be used in the search brief.
    // This is not a good implementation but im afraid if we filter and find itll be slow.
    // I can change this on request: felix
    

    expfilter = {
            // This is a table named "experience"
            // If you change this you must remigrate the experience table and add the new field.
            filterType: BriefFilterOption.ExpLevel,
            label: "Experience Level",
            options: [
                {
                    interiorIndex: 0,
                    search_for: [0],
                    value: "Entry Level",
                    or_max: false,

                },
                {
                    interiorIndex: 1,
                    search_for: [1],
                    value: "Intermediate",
                    or_max: false,
                },
                {
                    interiorIndex: 2,
                    search_for: [2],
                    value: "Expert",
                    or_max: false,
                },
                {
                    interiorIndex: 3,
                    search_for: [3],
                    value: "Specialist",
                    or_max: false,
                },
            ],
        }


    submittedFilters = {
            // This is a field associated with the User.
            // since its a range i need the 
            filterType: BriefFilterOption.AmountSubmitted,
            label: "Briefs Submitted",
            options: [
                {
                    interiorIndex: 0,
                    search_for: [0, 1, 2, 3, 4],
                    value: "0-4",
                    or_max: false,
                },
                {
                    interiorIndex: 1,
                    search_for: [5, 6, 7, 8, 9],
                    value: "5-9",
                    or_max: false,
                },
                {
                    interiorIndex: 2,
                    search_for: [10, 11, 12, 13, 14],
                    value: "10-14",
                    or_max: false,
                },
                {
                    interiorIndex: 3,
                    search_for: [15, 10000],
                    value: "15+",
                    or_max: true,
                },
            ],
        }
        
        lengthFilters = 
        {
            // Should be a field in the database, WILL BE IN DAYS.
            // Again i need the high and low values.
            filterType: BriefFilterOption.Length,
            label: "Project Length",
            options: [
                {
                    interiorIndex: 0,
                    search_for: [1],
                    value: "1 month",
                    or_max: false,
                },
                {
                    interiorIndex: 1,
                    search_for: [1,2,3],
                    value: "1-3 months",
                    or_max: false,
                },
                {
                    interiorIndex: 2,
                    search_for: [3,4,5,6],
                    value: "3-6 months",
                    or_max: false,
                },
                {
                    interiorIndex: 3,
                    search_for: Array.from({length: 6}, (_, i) => (i + 6) + 1),
                    value: "6-12 months",
                    or_max: false,
                },
                {
                    interiorIndex: 4,
                    search_for: [12],
                    or_max: true,
                    value: "1 year +",
                },
                {
                    // years * months * days
                    interiorIndex: 5,
                    search_for: [12*5],
                    or_max: true,
                    value: "5 years +",
                },
            ],
        }
        hoursPwFilter: any = {
            filterType: BriefFilterOption.HoursPerWeek,
            label: "Hours Per Week",
            options: [
                {
                    interiorIndex: 0,
                    // This will be 0-30 as we actually use this as max value
                    search_for: [30],
                    or_max: false,
                    value: "30hrs/week",
                },
                {
                    interiorIndex: 1,
                    // Same goes for this
                    search_for: [50],
                    value: "50hrs/week",
                    or_max: true,
                },
            ],
        }
    
    constructor(props: BriefProps) {
        super(props);
        this.state = ({briefs: []});
    }

    async componentDidMount() {
        let data = await getAllBriefs();
        console.log(data);
        this.setState({ briefs: data});
    }

    // Here we have to get all the checked boxes and try and construct a query out of it...
    onSearch = async ()  =>  {
        let elements = document.getElementsByClassName("filtercheckbox") as HTMLCollectionOf<HTMLInputElement>;
    
        // The filter initially should return all values
        let is_search: boolean = false;
        
        let exp_range: Array<number> = [];
        
        let submitted_range: Array<number> = [];
        let submitted_is_max: boolean = false
        
        let length_range: Array<number> = [];
        let length_is_max: boolean = false
        
        // default is max
        let hpw_max: number = 50;
        let hpw_is_max: boolean = false;


        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                is_search = true
                let id = elements[i].getAttribute("id");
                if (id != null) {
                    let [filterType, interiorIndex] = id.split("-");
                    // Here we are trying to build teh paramaters required to build the query
                    // We build an array for each to get the values we want through concat.
                    // and also specify if we want more than using the is_max field. 
                    let parsed_index = parseInt(interiorIndex)
                    switch(parseInt(filterType)) {
                        case BriefFilterOption.ExpLevel:
                            let o = this.expfilter.options[parsed_index];    
                            exp_range.concat(o.search_for);
                       
                        case BriefFilterOption.AmountSubmitted:
                            let o1 = this.submittedFilters.options[parsed_index];
                            submitted_range.concat(o1.search_for);
                            submitted_is_max = o1.or_max; 

                        case BriefFilterOption.Length:
                            let o2 = this.lengthFilters.options[parsed_index]
                            length_range.concat(o2.search_for);
                            length_is_max = o2.or_max;
                        
                        case BriefFilterOption.HoursPerWeek:
                            let o3 = this.hoursPwFilter.options[parsed_index];
                            if (o3.search_for[0] > hpw_max) {
                                hpw_max = o3.search_for[0];
                            }
                            hpw_is_max = o3.or_max; 
                        
                        default:
                            console.log("Invalid filter option selected or unimplemented.");
                    }
                }
            }
        }

        if (is_search) {
            let briefs = await callSearchBriefs(
                exp_range, submitted_range, submitted_is_max, length_range, length_is_max, hpw_max, hpw_is_max 
            )
            this.setState({ briefs: briefs });

        } else {
            let briefs = await getAllBriefs()
            this.setState({ briefs: briefs });
        }
    };

    onSavedBriefs = () => {

    };

    render() {
        return (
            <div className="search-briefs-container">
                <div className="filter-panel">
                    <div className="filter-heading">Filter By</div>
                    <BriefFilter label={this.expfilter.label} filter_type={BriefFilterOption.ExpLevel} filter_options={this.expfilter.options}></BriefFilter>
                    <BriefFilter label={this.submittedFilters.label} filter_type={BriefFilterOption.AmountSubmitted} filter_options={this.submittedFilters.options}></BriefFilter>
                    <BriefFilter label={this.lengthFilters.label} filter_type={BriefFilterOption.Length} filter_options={this.lengthFilters.options}></BriefFilter>
                    <BriefFilter label={this.hoursPwFilter.label} filter_type={BriefFilterOption.HoursPerWeek} filter_options={this.hoursPwFilter.options}></BriefFilter>
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
                                <div className="brief-title">{item.headline}</div>
                                <div className="brief-time-info">
                                    {`${item.experience_level}, Est. Time: ${item.duration}. Posted ${item.created}`}
                                </div>
                                <div className="brief-description">
                                    {item.description}
                                </div>
                                <div className="brief-tags">
                                    {/* {item.skills.map((skill: any, skillIndex: any) => (
                                        <div
                                            className="tag-item"
                                            key={skillIndex}
                                        >
                                            {skill}
                                        </div>
                                    ))} */}
                                </div>
                                <div className="brief-proposals">
                                    <span className="proposals-heading">
                                        Proposals Submitted:{" "}
                                    </span>
                                    <span className="proposals-count">
                                        {item.briefs_submitted}
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
