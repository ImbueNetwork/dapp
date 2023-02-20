import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer, Item } from "../../models";
import * as utils from "../../utils";
import "../../../../public/freelancers.css";
import { getAllFreelancers } from "../../services/freelancerService";
import { FreelancerFilterOption, FilterOption } from "../../types/freelancers";
import FreelancerFilter from "../../components/freelancerFilter";

export const Freelancers = (): JSX.Element => {

    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [skills, setSkills] = useState<Item[]>([]);
    const [services, setServices] = useState<Item[]>([]);
    const [languages, setLanguages] = useState<Item[]>([]);

    const fetchAndSetFreelancers = async () => {
        const data = await getAllFreelancers();

        var combinedSkills = [].concat.apply([], ...data.map(x => x.skills));
        const dedupedSkills = [...new Set([...combinedSkills])]

        var combinedServices = [].concat.apply([], ...data.map(x => x.services));
        const dedupedServices = [...new Set([...combinedServices])]

        var combinedLanguages = [].concat.apply([], ...data.map(x => x.languages));
        const dedupedLanguages = [...new Set([...combinedLanguages])]

        setFreelancers(data);
        setSkills(dedupedSkills);
        setServices(dedupedServices);
        setLanguages(dedupedLanguages);
    };


    useEffect(() => {
        void fetchAndSetFreelancers();
    }, []);


    const redirectToProfile = (username) => {
        utils.redirect(`freelancers/${username}`);
    }

    const skillsFilter = {
        filterType: FreelancerFilterOption.Services,
        label: "Skills",
        options: skills.map(item => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            }
            return filter
        }),
    };

    const servicesFilter = {
        // This is a field associated with the User.
        // since its a range i need the
        filterType: FreelancerFilterOption.Services,
        label: "Services",
        options: services.map(item => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            }
            return filter
        }),
    };

    const languagesFilter = {
        // Should be a field in the database, WILL BE IN DAYS.
        // Again i need the high and low values.
        filterType: FreelancerFilterOption.Languages,
        label: "Languages",
        options: languages.map(item => {
            let filter = {
                interiorIndex: item.id,
                value: item.name,
            }
            return filter
        }),
    };

    const onSearch = async () => {
        // TODO implement search
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

                        {freelancers.slice(0, 10).map(
                            (
                                {
                                    title,
                                    username,
                                    skills,
                                },
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
                                        <h3>{title}</h3>
                                        <div className="skills">
                                            {skills?.slice(0, 3).map(
                                                (skill, index) => (
                                                    <p
                                                        className="skill"
                                                        key={index}
                                                    >
                                                        {skill.name}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <button className="primary-button full-width" onClick={() => redirectToProfile(username)}>
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
    ReactDOMClient.createRoot(
        document.getElementById("freelancers")!
    ).render(<Freelancers />);
});
