import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import {
    FaFacebook,
    FaRegShareSquare,
    FaTwitter,
    FaTelegram,
    FaDiscord,
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TextInput } from "../../components/textInput";
import { getFreelancerProfile } from "../../services/freelancerService";
import { Freelancer, Item, User } from "../../models";
import { FreelancerSocial } from "./freelancer_socials";
import { fetchUser, getCurrentUser, getStreamChat, redirect } from "../../utils";
import { ChatBox } from "../../components/chat";
import Modal from 'react-bootstrap/Modal';

import "../../../../public/freelancer-profile.css";

import 'bootstrap/dist/css/bootstrap.min.css';

export type ProfileProps = {
    freelancer: Freelancer;
};

export type ProfileState = {
    browsingUser: User;
    isEditingBio: boolean;
    bioEdit: string;
    userInfo: UserInfo;
    showMessageForm: boolean,
    is_found: boolean;
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
    socials: {
        facebook: string;
        twitter: string;
        // google: string;
        telegram: string;
        discord: string;
    };
    skills?: Array<Item>;
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

export const Profile = ({ freelancer: freelancer }: ProfileProps): JSX.Element => {
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
    const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
    const [browsingUser, setBrowsingUser] = useState<User | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const isCurrentFreelancer = (browsingUser && browsingUser.id == freelancer.user_id);

    const profileImageUrl = "/public/profile-image.png";

    const onSaveBio = () => {
        //this.setState({
        //});
    };

    useEffect(() => {
        const setup = async () => {
            setBrowsingUser(await getCurrentUser());
            setTargetUser(await fetchUser(freelancer.user_id));
        }
        setup();
    }, [])

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
                            src={profileImageUrl}
                            alt=""
                        />
                    </div>
                    <div className="profile-summary">
                        <h5>{freelancer.display_name}</h5>
                        {/* <div className="rating">
                                {
                                    Array.from({ length: userInfo.rating.stars }, (_, i) => i).map((i) => (
                                        <p key={i}><FaStar color="var(--theme-yellow)" /></p>
                                    ))
                                }
                                <p>
                                    <span>{userInfo.rating.level}</span>
                                    <span className="review-count">
                                        {`(${userInfo.rating.numReviews} reviews)`}
                                    </span>
                                </p>
                            </div> */}
                        <div className="contact">
                            <p>@{freelancer.username}</p>
                            <IoPeople
                                color="var(--theme-secondary)"
                                size="24px"
                            />
                            <p>{freelancer.display_name}</p>
                        </div>
                        <div className="connect-buttons">

                            { !isCurrentFreelancer &&
                                <>
                                    <button onClick={() => handleMessageBoxClick()} className="primary-button full-width">Message</button>
                                    {browsingUser && showMessageBox && renderChat}
                                </>
                            }
                            <button className="primary-button full-width">
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
                        {!isEditingBio && (
                            <div
                                className="edit-icon"
                                onClick={() => setIsEditingBio(true)}
                            >
                                <FiEdit />
                            </div>
                        )}
                    </div>
                    {isEditingBio ? (
                        <>
                            <TextInput
                                maxLength={1000}
                                value={freelancer.bio}
                                onChange={onSaveBio}
                                className="bio-input"
                            />
                            <div className="edit-bio-buttons">
                                <button
                                    className="primary-btn in-dark w-full"
                                    onClick={onSaveBio}
                                >
                                    Save
                                </button>
                                <button
                                    className="secondary-btn in-dark w-full"

                                >
                                    Cancel
                                </button>
                            </div>
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
                                    {
                                        FreelancerSocial({
                                            label: "Facebook",
                                            key: "facebook",
                                            icon: <FaFacebook />,
                                            link: freelancer.facebook_link,
                                        })
                                    }{
                                        FreelancerSocial({
                                            label: "Twitter",
                                            key: "twitter",
                                            icon: <FaTwitter />,
                                            link: freelancer.twitter_link,
                                        })
                                    }{
                                        FreelancerSocial({
                                            label: "Telegram",
                                            key: "telegram",
                                            icon: <FaTelegram />,
                                            link: freelancer.telegram_link,
                                        })
                                    }{
                                        FreelancerSocial({
                                            label: "Discord",
                                            key: "discord",
                                            icon: <FaDiscord />,
                                            link: freelancer.discord_link,
                                        })
                                    }
                                </div>
                            </div>
                            <div className="divider" />
                            <div className="subsection">
                                <div className="header-editable">
                                    <h5>Skills</h5>
                                    <div className="btn-add">Add Now</div>
                                </div>
                                <div className="skills">
                                    {freelancer.skills?.map(
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
                        {/* <div className="section portfolio-breakdown">
                                <div className="subsection">
                                    <h5>Portfolio Breakdown</h5>
                                </div>
                                <div className="divider" />
                                <div className="subsection">
                                    {freelancer.portfolio?.map(
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
                            </div> */}
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
        ReactDOMClient.createRoot(
            document.getElementById("freelancer-profile")!
        ).render(<Profile freelancer={freelancer} />);
    }
    // TODO redirect to 404 if no freelancer found
});
