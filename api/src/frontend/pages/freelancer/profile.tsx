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
import { TextInput } from "../../components/textInput";
import { getFreelancerProfile } from "../../services/freelancerService";
import { Freelancer } from "../../models";
import { Freelancers } from "./new";

export type ProfileProps = {};
export type ProfileState = {
    isEditingBio: boolean;
    bioEdit: string;
    userInfo: UserInfo;
};

export type UserInfo = {
    name: string;
    profileImageUrl: string;
    location: {
        country: string;
        address: string;
    };
    rating: {
        stars: number;
        level: string;
        numReviews: number;
    };
    contact: {
        username: string;
        title: string;
    };
    bio: string;
    socials?: {
        facebook?: string;
        twitter?: string;
        // google: string;
        telegram?: string;
        discord?: string;
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
        // {
        //     label: "Google",
        //     key: "google",
        //     icon: <FaGoogle />,
        // },
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
        isEditingBio: false,
        userInfo: {
            name: "Idris Muhammad",
            profileImageUrl: "/public/profile-image.png",
            location: {
                country: "US",
                address: "Los Angeles, United State",
            },
            bio: `The Blockchain world has never been more exciting than right now.\nBut in this fast-growing space, finding top talent and the perfect project can be tough\n| Cryptocurrency | Blockchain | Ethereum | Web3 | Smart Contract | DApps | DeFi | Solidity |\n| Rust | C | C ++ | C# | Python | Golang | Java | Javascript | Scala | Simplicity | Haskell |`,
            rating: {
                level: "Top Rated",
                numReviews: 1434,
                stars: 4,
            },
            portfolio: [
                {
                    category: "NFT",
                    rate: 64.32,
                },
            ],
            contact: {
                username: "abbioty",
                title: "Lead product designer Google",
            },
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
        },
        bioEdit: "",
    };

    onSaveBio = () => {
        this.setState({
            ...this.state,
            isEditingBio: false,
            userInfo: {
                ...this.state.userInfo,
                bio: this.state.bioEdit,
            },
        });
    };


    async componentDidMount() {
        const freelancer = await getFreelancerProfile();
        await this.populateProfile(freelancer)
    }


    async populateProfile(freelancer: Freelancer) {

        this.setState({
            ...this.state,
            userInfo: {
                ...this.state.userInfo,
                contact: {username: freelancer.username, title: freelancer.title },
                name: freelancer.display_name,
                skills: freelancer.skills,
                bio: freelancer.bio,
                socials: {facebook: freelancer.facebook_link, discord: freelancer.discord_link, twitter: freelancer.twitter_link, telegram: freelancer.telegram_link}
            },
        });
    }

    render() {
        const { userInfo } = this.state;
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
                                src={userInfo.profileImageUrl}
                                alt="profile image"
                            />
                        </div>
                        <div className="profile-summary">
                            <h5>{userInfo.name}</h5>
                            <div className="location">
                                <ReactCountryFlag
                                    countryCode={userInfo.location.country}
                                />
                                <p>{userInfo.location.address}</p>
                            </div>
                            <div className="rating">
                                <p>
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                    <FaStar color="var(--theme-yellow)" />
                                </p>
                                <p>
                                    <span>{userInfo.rating.level}</span>
                                    <span className="review-count">
                                        {`(${userInfo.rating.numReviews} reviews)`}
                                    </span>
                                </p>
                            </div>
                            <div className="contact">
                                <p>@{userInfo.contact.username}</p>
                                <IoPeople
                                    color="var(--theme-secondary)"
                                    size="24px"
                                />
                                <p>{userInfo.contact.title}</p>
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
                            {!this.state.isEditingBio && (
                                <div
                                    className="edit-icon"
                                    onClick={() =>
                                        this.setState({
                                            ...this.state,
                                            isEditingBio: true,
                                            bioEdit: userInfo.bio,
                                        })
                                    }
                                >
                                    <FiEdit />
                                </div>
                            )}
                        </div>
                        {this.state.isEditingBio ? (
                            <>
                                <TextInput
                                    maxLength={1000}
                                    value={this.state.bioEdit}
                                    onChange={(e) =>
                                        this.setState({
                                            ...this.state,
                                            bioEdit: e.target.value,
                                        })
                                    }
                                    className="bio-input"
                                />
                                <div className="edit-bio-buttons">
                                    <button
                                        className="primary-btn in-dark w-full"
                                        onClick={this.onSaveBio}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="secondary-btn in-dark w-full"
                                        onClick={() =>
                                            this.setState({
                                                ...this.state,
                                                isEditingBio: false,
                                            })
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="bio">
                                {this.state.userInfo.bio
                                    .split("\n")
                                    .map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                            </div>
                        )}
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
                                                        {userInfo.socials &&
                                                        userInfo.socials[key]
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
                                        {userInfo.skills?.map(
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
                                    {userInfo.portfolio?.map(
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
                            {userInfo.projects?.map(
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
