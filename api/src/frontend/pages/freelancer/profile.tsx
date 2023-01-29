import React from "react";
import ReactDOMClient from "react-dom/client";
import ReactCountryFlag from "react-country-flag";
import {
    FaFacebook,
    FaStar,
    FaRegShareSquare,
    FaTwitter,
    FaGoogle,
    FaTelegram,
    FaDiscord,
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";

import "../../../../public/freelancer-profile.css";
import { timeStamp } from "console";

export type ProfileProps = {};
export type ProfileState = {
    socials?: {
        facebook: string;
        twitter: string;
        google: string;
        telegram: string;
        discord: string;
    };
    skills?: Array<string>;
    portfolio?: Array<{
        category: string;
        rate: number;
    }>;
    projects?: Array<{
        image: string;
        title: string;
        percent: number;
        milestoneCount: number;
        milestoneComplete: number;
    }>;
};

export class Profile extends React.Component<ProfileProps, ProfileState> {
    socials = [
        {
            label: "Facebook",
            key: "facebook",
            icon: <FaFacebook />,
        },
        {
            label: "Twitter",
            key: "twitter",
            icon: <FaTwitter />,
        },
        {
            label: "Google",
            key: "google",
            icon: <FaGoogle />,
        },
        {
            label: "Telegram",
            key: "telegram",
            icon: <FaTelegram />,
        },
        {
            label: "Discord",
            key: "discord",
            icon: <FaDiscord />,
        },
    ];
    state: ProfileState = {
        portfolio: [
            {
                category: "NFT",
                rate: 64.32,
            },
        ],
        projects: [
            {
                image: "",
                title: "NFT project",
                percent: 52,
                milestoneComplete: 2,
                milestoneCount: 4,
            },
            {
                image: "",
                title: "NFT project",
                percent: 52,
                milestoneComplete: 2,
                milestoneCount: 4,
            },
            {
                image: "",
                title: "NFT project",
                percent: 52,
                milestoneComplete: 2,
                milestoneCount: 4,
            },
            {
                image: "",
                title: "NFT project",
                percent: 52,
                milestoneComplete: 2,
                milestoneCount: 4,
            },
            {
                image: "",
                title: "NFT project",
                percent: 52,
                milestoneComplete: 2,
                milestoneCount: 4,
            },
        ],
    };
    render() {
        return (
            <div className="profile-container">
                <div className="banner">
                    <img
                        src="/public/profile-banner.png"
                        alt="profile banner"
                        className="banner-image"
                    />
                </div>
                <div className="info-container">
                    <div className="section summary">
                        <div className="profile-image">
                            <img
                                src="/public/profile-image.png"
                                alt="profile image"
                            />
                        </div>
                        <div className="profile-summary">
                            <h5>Idris Muhammad</h5>
                            <div className="location">
                                <ReactCountryFlag countryCode="US" />
                                <p>Los Angeles, United State</p>
                            </div>
                            <div className="rating">
                                <p>
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                </p>
                                <p>
                                    <span>Top Rated</span>
                                    <span className="review-count">
                                        (1434 reviews)
                                    </span>
                                </p>
                            </div>
                            <div className="contact">
                                <p>@abbioty</p>
                                <IoPeople
                                    color="var(--theme-secondary)"
                                    size="24px"
                                />
                                <p>Lead product designer Google</p>
                            </div>
                            <div className="connect-buttons">
                                <button className="message">Message</button>
                                <button className="share">
                                    <FaRegShareSquare color="white" /> {"  "}
                                    Share Profile
                                </button>
                            </div>
                            <div className="divider"></div>
                            <div className="show-more">
                                Show more{"  "}
                                <MdKeyboardArrowDown size="20" />
                            </div>
                        </div>
                    </div>
                    <div className="section about">
                        <div className="header-editable">
                            <h5>About</h5>
                            <div className="edit-icon">
                                <FiEdit />
                            </div>
                        </div>
                        <p>
                            The Blockchain world has never been more exciting
                            than right now.
                        </p>
                        <p>
                            But in this fast-growing space, finding top talent
                            and the perfect project can be tough
                        </p>
                        <p>
                            | Cryptocurrency | Blockchain | Ethereum | Web3 |
                            Smart Contract | DApps | DeFi | Solidity |
                        </p>
                        <p>
                            | Rust | C | C ++ | C# | Python | Golang | Java |
                            Javascript | Scala | Simplicity | Haskell |
                        </p>
                    </div>
                    <div className="portfolio">
                        <div className="detailed-info">
                            <div className="section user-info">
                                <div className="subsection">
                                    <h5>Linked Account</h5>
                                    <div className="social-links">
                                        {this.socials.map(
                                            ({ label, key, icon }, index) => (
                                                <div
                                                    className="social-link"
                                                    key={index}
                                                >
                                                    <p>{label}</p>
                                                    <button className="social-btn">
                                                        {this.state.socials &&
                                                        this.state.socials[key]
                                                            ? icon
                                                            : "+"}
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="divider" />
                                <div className="subsection">
                                    <div className="header-editable">
                                        <h5>Skills</h5>
                                        <div className="btn-add">Add Now</div>
                                    </div>
                                    <div className="skills">
                                        {this.state.skills?.map(
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
                                <div className="divider" />
                                <div className="subsection">
                                    <div className="header-editable">
                                        <h5>Certification</h5>
                                        <div className="btn-add">Add Now</div>
                                    </div>
                                    <p className="text-grey">
                                        Add your certification
                                    </p>
                                </div>
                            </div>
                            <div className="section portfolio-breakdown">
                                <div className="subsection">
                                    <h5>Portfolio Breakdown</h5>
                                </div>
                                <div className="divider" />
                                <div className="subsection">
                                    {this.state.portfolio?.map(
                                        ({ category, rate }, index) => (
                                            <div
                                                className="breakdown-item"
                                                key={index}
                                            >
                                                <p className="category">
                                                    {category}
                                                </p>
                                                <div className="progress-container">
                                                    <div
                                                        className="progress-indicator"
                                                        style={{
                                                            width: `${rate}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="rate">{rate}%</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="section activities">
                                <div className="subsection">
                                    <h5>Account Activities</h5>
                                </div>
                                <div className="divider" />
                                <div className="activity-list">
                                    <div className="activity-record">
                                        {/* TODO: */}
                                        <p>Trusted Device Management</p>
                                        <button className="primary-button">
                                            Management
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="projects">
                            {this.state.projects?.map(
                                (
                                    {
                                        image,
                                        milestoneComplete,
                                        milestoneCount,
                                        percent,
                                        title,
                                    },
                                    index
                                ) => (
                                    <div className="project" key={index}>
                                        <div className="project-image-container">
                                            {/* TODO: */}
                                            <img
                                                src="/public/project.png"
                                                width="100%"
                                                height="100%"
                                            />
                                            <div className="dark-layer" />
                                        </div>
                                        <div className="project-info">
                                            <h5>{title}</h5>
                                            <div className="project-progress">
                                                <div
                                                    className="project-progress-indicator"
                                                    style={{
                                                        width: `${percent}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="milestone-progress">
                                                <p>{percent}%</p>
                                                <p>{`Milestone ${
                                                    milestoneComplete ?? 0
                                                }/${milestoneCount}`}</p>
                                            </div>
                                        </div>
                                        <button className="primary-button full-width">
                                            Read More
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
    ReactDOMClient.createRoot(
        document.getElementById("freelancer-profile")!
    ).render(<Profile />);
});
