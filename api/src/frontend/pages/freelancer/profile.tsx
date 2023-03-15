import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import ReactCountryFlag from "react-country-flag";
import {
    FaFacebook,
    FaStar,
    FaRegShareSquare,
    FaTwitter,
    FaTelegram,
    FaDiscord,
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";

import "../../../../public/freelancer-profile.css";
import { timeStamp } from "console";
import { Freelancer, User } from "../../models";
import { getFreelancerProfile, updateFreelancer } from "../../services/freelancerService";

import { fetchUser, getCurrentUser, getStreamChat, redirect } from "../../utils";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../../../public/freelancer-profile.css";

import { TextInput, ChatBox } from "../../components";

export type ProfileProps = {
    initFreelancer: Freelancer;
};

export const Profile = ({ initFreelancer: initFreelancer }: ProfileProps): JSX.Element => {
    const [freelancer, setFreelancer] = useState<Freelancer>(initFreelancer);
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
    const [browsingUser, setBrowsingUser] = useState<User | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const isCurrentFreelancer = (browsingUser && browsingUser.id == freelancer.user_id);

    const socials = [
        {
            label: "Facebook",
            key: "facebook_link",
            value: freelancer.facebook_link,
            icon: <FaFacebook onClick={() => redirect(freelancer.facebook_link)} />,
        },
        {
            label: "Twitter",
            key: "twitter_link",
            value: freelancer.twitter_link,
            icon: <FaTwitter onClick={() => redirect(freelancer.twitter_link)} />,
        },
        {
            label: "Telegram",
            key: "telegram_link",
            value: freelancer.telegram_link,
            icon: <FaTelegram onClick={() => redirect(freelancer.telegram_link)} />,
        },
        {
            label: "Discord",
            key: "discord_link",
            value: freelancer.discord_link,
            icon: <FaDiscord onClick={() => redirect(freelancer.discord_link)} />,
        },
    ];

    useEffect(() => {
        const setup = async () => {
            const browsingUser = await getCurrentUser();
            setBrowsingUser(browsingUser);
            setTargetUser(await fetchUser(freelancer?.user_id));
        }
        setup();
    }, []);

    //The fields must be pre populated correctly.
    const onSave = async () => {
        await updateFreelancer(freelancer);
        flipEdit()
    };

    const renderChat = (
        <Modal show={showMessageBox} onHide={() => setShowMessageBox(false)}>
            <Modal.Body>
                {(browsingUser && targetUser) ? <ChatBox user={browsingUser} targetUser={targetUser} ></ChatBox> : <p>REACT_APP_GETSTREAM_API_KEY not found</p>}

            </Modal.Body>
            <Modal.Footer>
                <button className="primary-button" onClick={() => setShowMessageBox(false)}>Close</button>
            </Modal.Footer>
        </Modal>
    );

    const handleMessageBoxClick = () => {
        if (browsingUser) {
            setShowMessageBox(true);
        } else {
            redirect("login", `/dapp/freelancers/${freelancer.username}/`)
        }
    }

    const flipEdit = () => {
        setIsEditMode(!isEditMode)
    }

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
                        <h5>{freelancer.display_name}</h5>
                        {/* <div className="location">
                            <ReactCountryFlag countryCode="US" />
                            <p>Los Angeles, United State</p>
                        </div> */}
                        {/* <div className="rating">
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
                        </div> */}
                        <div className="contact">
                            <p>@{freelancer.username}</p>
                            <IoPeople
                                color="var(--theme-secondary)"
                                size="24px"
                            />
                            <p>{freelancer.title}</p>
                        </div>
                        <div className="connect-buttons">

                            {!isCurrentFreelancer &&
                                <>
                                    <button onClick={() => handleMessageBoxClick()} className="message">Message</button>
                                    {browsingUser && showMessageBox && renderChat}
                                </>

                            }
                            {!isEditMode && isCurrentFreelancer &&
                                <button onClick={() => flipEdit()} className="message">Edit Profile <FiEdit /></button>
                            }
                            {isEditMode && isCurrentFreelancer &&
                                <button onClick={() => onSave()} className="message">Save Changes <FiEdit /></button>
                            }

                            <button className="share" >
                                <FaRegShareSquare color="white" /> {"  "}
                                Share Profile
                            </button>
                        </div>
                        {/* TODO: Implement */}
                        {/* <div className="divider"></div>
                        <div className="show-more">
                            Show more{"  "}
                            <MdKeyboardArrowDown size="20" />
                        </div> */}
                    </div>
                </div>
                <div className="section about">
                    <div className="header-editable">
                        <h5>About</h5>
                    </div>
                    {isEditMode ? (
                        <>
                            <TextInput
                                maxLength={1000}
                                value={freelancer.bio}
                                onChange={(e) => {
                                    setFreelancer(
                                        {
                                            ...freelancer,
                                            bio: e.target.value
                                        }
                                    )
                                }}
                                className="bio-input"
                                id="bio-input-id"
                            />

                        </>
                    ) : (
                        <div className="bio">
                            {freelancer.bio
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
                                    {socials.map(
                                        ({ label, key, value, icon }, index) => (

                                            !isEditMode ? (
                                                <div className="social-link" key={index} >
                                                    <p>{label} </p>
                                                    <button className="social-btn">
                                                        {socials &&
                                                            value
                                                            ? icon
                                                            : "+"}
                                                    </button>
                                                </div>
                                            )
                                                : (
                                                    <div className="social-link" key={index} >
                                                        <TextInput
                                                            value={freelancer[key]}
                                                            onChange={(e) => {
                                                                setFreelancer(
                                                                    {
                                                                        ...freelancer,
                                                                        [key]: e.target.value,
                                                                    }
                                                                )
                                                            }}
                                                            className="bio-input"
                                                            id="bio-input-id"
                                                        />
                                                    </div>
                                                )
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="divider" />
                            <div className="subsection">
                                <div className="header-editable">
                                    <h5>Skills</h5>
                                </div>
                                <div className="skills">
                                    {/* TODO: Add Skills */}
                                    {freelancer.skills?.map(
                                        (skill) => (
                                            <p
                                                className="skill"
                                                key={skill.id}
                                            >
                                                {skill.name}
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="divider" />
                            {/* TODO: Implement */}
                            {/* <div className="subsection">
                                <div className="header-editable">
                                    <h5>Certification</h5>
                                    <div className="btn-add">Add Now</div>
                                </div>
                                <p className="text-grey">
                                    Add your certification
                                </p>
                            </div> */}
                        </div>
                        {/* <div className="section portfolio-breakdown">
                            <div className="subsection">
                                <h5>Portfolio Breakdown</h5>
                            </div>
                            <div className="divider" />
                            <div className="subsection">
                                {portfolio?.map(
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
                        {/* <div className="section activities">
                            <div className="subsection">
                                <h5>Account Activities</h5>
                            </div>
                            <div className="divider" />
                            <div className="activity-list">
                                <div className="activity-record">
                                    <p>Trusted Device Management</p>
                                    <button className="primary-button">
                                        Management
                                    </button>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    {/* <div className="projects">
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
                                            <p>{`Milestone ${milestoneComplete ?? 0
                                                }/${milestoneCount}`}</p>
                                        </div>
                                    </div>
                                    <button className="primary-button full-width">
                                        Read More
                                    </button>
                                </div>
                            )
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    );
}

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let username = paths.length >= 2 && paths[paths.length - 2];

    if (username) {
        const freelancer = await getFreelancerProfile(username);
        if (freelancer) {
            ReactDOMClient.createRoot(
                document.getElementById("freelancer-profile")!
            ).render(<Profile initFreelancer={freelancer} />);
        }
        // TODO redirect to 404 if no freelancer found
    }
});