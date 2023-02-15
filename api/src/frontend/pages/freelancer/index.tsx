import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer } from "../../models";
import * as utils from "../../utils";
import "../../../../public/freelancers.css";
import { getAllFreelancers } from "../../services/freelancerService";
import { FreelancerFilterOption } from "../../types/freelancers";
import FreelancerFilter from "../../components/freelancerFilter";

export const Freelancers = (): JSX.Element => {

    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);


    const fetchAndSetFreelancers = async () => {
        const data = await getAllFreelancers();
        setFreelancers(data);
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
        options: [
            {
                interiorIndex: 0,
                value: "React",
            },
            {
                interiorIndex: 1,
                value: "Figma",
            },
            {
                interiorIndex: 2,
                value: "Solidity",
            },
            {
                interiorIndex: 3,
                value: "Rust",
            },
        ],
    };

    const servicesFilter = {
        // This is a field associated with the User.
        // since its a range i need the
        filterType: FreelancerFilterOption.Services,
        label: "Services",
        options: [
            {
                interiorIndex: 0,
                value: "Web Development",
            },
            {
                interiorIndex: 1,
                value: "Web Design",
            },
            {
                interiorIndex: 2,
                value: "Mobile (Android/iOS)",
            },
            {
                interiorIndex: 3,
                value: "Smart Contract",
            },
            {
                interiorIndex: 4,
                value: "Copy Writing",
            },
            {
                interiorIndex: 5,
                value: "Video Editing",
            },
            {
                interiorIndex: 6,
                value: "NFT",
            },
        ],
    };

    const languagesFilter = {
        // Should be a field in the database, WILL BE IN DAYS.
        // Again i need the high and low values.
        filterType: FreelancerFilterOption.Languages,
        label: "Lanugages",
        options: [
            {
                interiorIndex: 0,
                value: "English",
            },
            {
                interiorIndex: 1,
                search_for: [2],
                value: "French",
            },
            {
                interiorIndex: 2,
                value: "German",
            },
            {
                interiorIndex: 3,
                value: "Spanish",
            },
            {
                interiorIndex: 4,
                value: "Arabic",
            },
            {
                interiorIndex: 5,
                value: "Hindi",
            },
            {
                interiorIndex: 6,
                value: "Urdu",
            },
        ],
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
                                                        {skill}
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
