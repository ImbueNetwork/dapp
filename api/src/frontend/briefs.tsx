import React from "react";
import ReactDOMClient from "react-dom/client";
import BriefFilter from "./components/briefFilter";
import {Brief, BriefSqlFilter} from "./models";
import {callSearchBriefs, getAllBriefs} from "./services/briefsService";

export type FilterOption = {
    interiorIndex: number;
    search_for: number[];
    or_max: boolean;
    value: string;
};


export type BriefProps = {};

export type BriefState = {
    briefs: Brief[];
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
        hoursPwFilter = {
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
        const data = await getAllBriefs();
        this.setState({ briefs: data});
    }

    // Here we have to get all the checked boxes and try and construct a query out of it...
    onSearch = async ()  =>  {
        const elements = document.getElementsByClassName("filtercheckbox") as HTMLCollectionOf<HTMLInputElement>;

        // The filter initially should return all values
        let is_search: boolean = false;

        let exp_range: number[] = [];

        let submitted_range: number[] = [];
        let submitted_is_max: boolean = false;

        let length_range: number[] = [];
        let length_is_max: boolean = false;

        // default is max
        let hpw_max: number = 50;
        let hpw_is_max: boolean = false;
        let search_input = document.getElementById("search-input") as HTMLInputElement;
        let search_value = search_input.value; 
        if (search_value !== "") {
            is_search = true
        }

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                is_search = true
                const id = elements[i].getAttribute("id");
                if (id != null) {
                    const [filterType, interiorIndex] = id.split("-");
                    // Here we are trying to build teh paramaters required to build the query
                    // We build an array for each to get the values we want through concat.
                    // and also specify if we want more than using the is_max field.
                    switch(parseInt(filterType) as BriefFilterOption) {
                        case BriefFilterOption.ExpLevel:
                            const o = this.expfilter.options[parseInt(interiorIndex)];
                            exp_range = [...exp_range ,...o.search_for.slice()];
                            break

                            case BriefFilterOption.AmountSubmitted:
                            const o1 = this.submittedFilters.options[parseInt(interiorIndex)];
                            submitted_range = [...submitted_range ,...o1.search_for.slice()];
                            submitted_is_max = o1.or_max;
                            break

                        case BriefFilterOption.Length:
                            const o2 = this.lengthFilters.options[parseInt(interiorIndex)]
                            length_range = [...length_range ,...o2.search_for.slice()];
                            length_is_max = o2.or_max;
                            break

                        case BriefFilterOption.HoursPerWeek:
                            const o3 = this.hoursPwFilter.options[parseInt(interiorIndex)];
                            if (o3.search_for[0] > hpw_max) {
                                hpw_max = o3.search_for[0];
                            }
                            hpw_is_max = o3.or_max;
                            break

                        default:
                            console.log("Invalid filter option selected or unimplemented. type:" + filterType);
                    }
                }
            }
        }

        if (is_search) {
            const filter: BriefSqlFilter = {
                experience_range: exp_range,
                submitted_range,
                submitted_is_max,
                length_range,
                length_is_max,
                max_hours_pw: hpw_max,
                hours_pw_is_max: hpw_is_max,
                search_input: search_value
            }
            console.log(filter);

            const briefs = await callSearchBriefs(filter)

            this.setState({ briefs });

        } else {
            const briefs = await getAllBriefs()
            this.setState({ briefs });
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
                        <input id="search-input" className="search-input" placeholder="Search" />
                        <div className="search-result">
                            <span className="result-count">{(this.state.briefs.length)}</span>
                            <span> briefs found</span>
                        </div>
                    </div>
                    <div className="briefs-list">
                        {this.state.briefs.map((item, itemIndex) => (
                            <div className="brief-item" key={itemIndex}>
                                <div className="brief-title">{item.headline}</div>
                                <div className="brief-time-info">
                                    {`${item.experience_level}, ${item.duration} Months, Posted by ${item.created_by}`}
                                </div>
                                <div className="brief-description">
                                    {item.description}
                                </div>
                                <div className="brief-tags">
                                    THIS HAS BEEN COMMENTED OUT UNTIL WE HAVE A ONE TO MANY TABLE FOR SKILLS.
                                    { {item.skills.map((skill: any, skillIndex: any) => (
                                        <div
                                            className="tag-item"
                                            key={skillIndex}
                                        >
                                            {item.skills}
                                        </div>
                                    {/* ))} } */}
                                </div>
                                <div className="brief-proposals">
                                    <span className="proposals-heading">
                                        Proposals Submitted:{" "}
                                    </span>
                                    <span className="proposals-count">
                                        {item.briefs_submitted_by}
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
