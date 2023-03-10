import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer, FreelancerSqlFilter, Item } from "../../models";
import * as utils from "../../utils";
import "../../../../public/freelancers.css";
import {
    callSearchFreelancers,
    getAllFreelancers,
} from "../../services/freelancerService";
import { FreelancerFilterOption, FilterOption } from "../../types/freelancers";
import FreelancerFilter from "../../components/freelancerFilter";

export const Freelancers = (): JSX.Element => {
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [skills, setSkills] = useState<Item[]>([]);
    const [services, setServices] = useState<Item[]>([]);
    const [languages, setLanguages] = useState<Item[]>([]);

    const fetchAndSetFreelancers = async () => {
        const data = await getAllFreelancers();

        let combinedSkills = Array.prototype.concat.apply(
            [],
            data.map((x) => x.skills)
        ) as Item[];
        const dedupedSkills = await dedupeArray(combinedSkills);

        var combinedServices = Array.prototype.concat.apply(
            [],
            data.map((x) => x.services)
        ) as Item[];
        const dedupedServices = await dedupeArray(combinedServices);

        var combinedLanguages = Array.prototype.concat.apply(
            [],
            data.map((x) => x.languages)
        ) as Item[];
        const dedupedLanguages = await dedupeArray(combinedLanguages);

        setSkills(dedupedSkills);
        setServices(dedupedServices);
        setLanguages(dedupedLanguages);
        setFreelancers(data);
    };

    const dedupeArray = async (input) => {
        return input
            .filter((thing, i, arr) => {
                return arr.indexOf(arr.find((t) => t.id === thing.id)) === i;
            })
            .sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
    };

    useEffect(() => {
        // TODO, show spinning loading wheel while we retreive data
        void fetchAndSetFreelancers();
    }, []);

    const redirectToProfile = (username) => {
        utils.redirect(`freelancers/${username}/`);
    };

    const skillsFilter = {
        filterType: FreelancerFilterOption.Services,
        label: "Skills",
        options: skills.map((item) => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            };
            return filter;
        }),
    };

    const servicesFilter = {
        // This is a field associated with the User.
        // since its a range i need the
        filterType: FreelancerFilterOption.Services,
        label: "Services",
        options: services.map((item) => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            };
            return filter;
        }),
    };

    const languagesFilter = {
        // Should be a field in the database, WILL BE IN DAYS.
        // Again i need the high and low values.
        filterType: FreelancerFilterOption.Languages,
        label: "Languages",
        options: languages.map((item) => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            };
            return filter;
        }),
    };

    const onSearch = async () => {
        const elements = document.getElementsByClassName(
            "filtercheckbox"
        ) as HTMLCollectionOf<HTMLInputElement>;

        // The filter initially should return all values
        let is_search: boolean = false;

        let skillsRange: number[] = [];
        let servicesRange: number[] = [];
        let languagesRange: number[] = [];

        let search_input = document.getElementById(
            "search-input"
        ) as HTMLInputElement;
        let search_value = search_input.value;
        if (search_value !== "") {
            is_search = true;
        }

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                is_search = true;
                const id = elements[i].getAttribute("id");
                if (id != null) {
                    const [filterType, interiorIndex] = id.split("-");
                    // Here we are trying to build teh paramaters required to build the query
                    // We build an array for each to get the values we want through concat.
                    // and also specify if we want more than using the is_max field.
                    switch (parseInt(filterType) as FreelancerFilterOption) {
                        case FreelancerFilterOption.Skills:
                            skillsRange = [
                                ...skillsRange,
                                parseInt(interiorIndex),
                            ];
                            break;
                        case FreelancerFilterOption.Services:
                            servicesRange = [
                                ...servicesRange,
                                parseInt(interiorIndex),
                            ];
                            break;
                        case FreelancerFilterOption.Languages:
                            languagesRange = [
                                ...languagesRange,
                                parseInt(interiorIndex),
                            ];
                            break;
                        default:
                            console.log(
                                "Invalid filter option selected or unimplemented. type:" +
                                    filterType
                            );
                    }
                }
            }
        }

        if (is_search) {
            const filter: FreelancerSqlFilter = {
                skills_range: skillsRange,
                services_range: servicesRange,
                languages_range: languagesRange,
                search_input: search_value,
            };

            const filteredFreelancers = await callSearchFreelancers(filter);
            setFreelancers(filteredFreelancers);
        } else {
            const allFreelancers = await getAllFreelancers();
            setFreelancers(allFreelancers);
        }
    };

    return (
        <div>
            <h1>Freelancers</h1>
            <div className="freelancers-container">
                <div className="filter-panel">
                    <div className="filter-heading">Filter By</div>
                    <FreelancerFilter
                        label={skillsFilter.label}
                        filter_type={FreelancerFilterOption.Skills}
                        filter_options={skillsFilter.options}
                    ></FreelancerFilter>
                    <FreelancerFilter
                        label={servicesFilter.label}
                        filter_type={FreelancerFilterOption.Services}
                        filter_options={servicesFilter.options}
                    ></FreelancerFilter>
                    <FreelancerFilter
                        label={languagesFilter.label}
                        filter_type={FreelancerFilterOption.Languages}
                        filter_options={languagesFilter.options}
                    ></FreelancerFilter>
                </div>

                <div className="freelancers-view">
                    <div className="search-heading">
                        <div className="tab-section">
                            <div className="tab-item" onClick={onSearch}>
                                Search
                            </div>
                        </div>
                        <input
                            id="search-input"
                            className="search-input"
                            placeholder="Search"
                        />
                        <div className="search-result">
                            <span className="result-count">
                                {freelancers.length}
                            </span>
                            <span> freelancers found</span>
                        </div>
                    </div>
                    <div className="freelancers">
                        {freelancers
                            .slice(0, 10)
                            .map(
                                (
                                    { title, username, display_name, skills },
                                    index
                                ) => (
                                    <div className="freelancer" key={index}>
                                        <div className="freelancer-image-container">
                                            <img
                                                src="/public/profile-image.png"
                                                className="freelancer-profile-pic"
                                            />
                                            <div className="dark-layer" />
                                        </div>
                                        <div className="freelancer-info">
                                            <h3>{display_name}</h3>
                                            <h5>{title}</h5>
                                            <div className="skills">
                                                {skills
                                                    ?.slice(0, 3)
                                                    .map((skill, index) => (
                                                        <p
                                                            className="skill"
                                                            key={index}
                                                        >
                                                            {skill.name}
                                                        </p>
                                                    ))}
                                            </div>
                                        </div>
                                        <button
                                            className="primary-button full-width"
                                            onClick={() =>
                                                redirectToProfile(username)
                                            }
                                        >
                                            View
                                        </button>
                                    </div>
                                )
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    ReactDOMClient.createRoot(document.getElementById("freelancers")!).render(
        <Freelancers />
    );
});
