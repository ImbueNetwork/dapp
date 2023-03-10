import React, { useEffect, useState } from "react";
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

import { TextInput } from "../../components/textInput";
<<<<<<< HEAD
import { Freelancer, Item } from "../../models";
import { getFreelancerProfile, updateFreelancer } from "../../services/freelancerService";
=======
import { getFreelancerProfile } from "../../services/freelancerService";
import { Freelancer, Item, User } from "../../models";
>>>>>>> real_time_messaging
import { Freelancers } from "./new";
import { FreelancerSocial } from "./freelancer_socials";
import { getCurrentUser, getStreamChat, redirect } from "../../utils";
import { ChatBox } from "../../components/chat";
import { Dialogue } from "../../components/dialogue";
import Modal from 'react-bootstrap/Modal';


import "../../../../public/freelancer-profile.css";

import 'bootstrap/dist/css/bootstrap.min.css';


export type ProfileProps = {
    freelancer: Freelancer;
};


export type ProfileState = {
browsingUser: User;
userInfo: UserInfo;
    showMessageForm: boolean,
    editBitMap: EditBitMap;
    edits: EditMaps;
}


export type UserInfo = {
    freelancer: Freelancer;
    location: {
        country: string;
        address: string;
    };
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


type EditBitMap = {
    isBio: boolean;
    isSkills: boolean;
    isSocials: boolean;
    isServices: boolean;
    isLanguages: boolean;
}

type EditMaps = {
    BioEdit?: string;
    SkillsEdits?: {add?: number[], remove?: number[]};
    SocialEdits?: {facebook?: string, discord?: string, telegram?: string, twitter?: string};
}

type MessageFormProps = {
    recipient: string;
    onClose: () => void;
};


const MessageForm = ({ recipient, onClose }: MessageFormProps) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
  
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      // Send the message to the backend
      // ...
      // Close the pop-up box
      onClose();
    }
  
    return (
      <div className="message-form-container">
        <h3>New Message</h3>
        <form onSubmit={handleSubmit} className="message-form">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="message-form-input"
          />
          <label htmlFor="body">Message</label>
          <textarea
            id="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="message-form-textarea"
          />
          <button type="submit" className="message-form-submit-button">Send</button>
        </form>
      </div>
    );
};

export const Profile = ({ freelancer: freelancer }: ProfileProps): JSX.Element => {
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
    const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
    const [browsingUser, setBrowsingUser] = useState<User| null>(null);
    const profileImageUrl = "/public/profile-image.png";


    const onSaveBio = () => {
        let freelancer = this.state.userInfo.freelancer;
        let input = document.getElementById("bio-input-id") as HTMLTextAreaElement;
        freelancer.bio = input.textContent || "";
        //this.setState({
        //});
    };

    function getCookie() {
        const isUser = document.cookie
            .split("; ")
            .find((row) => row.startsWith("isUser="))
            ?.split("=")[1];
        if(isUser === "false")
            return false;
        return true;
    }

    useEffect(() => {

        const fetchData = async () => {
            await populateProfile(freelancer)
        }
        fetchData();
    }, [])

    const populateProfile = async (freelancer: Freelancer) => {
        const browsingUser = await getCurrentUser();
        setBrowsingUser(browsingUser);
    }


    const renderChat = (
        <Modal show={showMessageBox} onHide={() => setShowMessageBox(false)}>
            <Modal.Body>
                {browsingUser ? <ChatBox user={browsingUser} freelancer={freelancer} ></ChatBox> : <p>REACT_APP_GETSTREAM_API_KEY not found</p>}
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
            redirect("login", `/dapp/freelancers/${freelancer.username}`)
        }
    }

    return (
        <div>
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
                                    {/* todo? */}
                                    {/* <span>{userInfo.rating.level}</span> */}
                                    <span className="review-count">
                                        {`(${userInfo.freelancer.num_ratings} reviews)`}
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
                            <button onClick={() => handleMessageBoxClick()} className="primary-button full-width">Message</button>
                            {/* {this.state.showMessageForm && this.state.browsingUser && (<ChatBox user={this.state.browsingUser} freelancerUsername={this.state.userInfo.contact.username} ></ChatBox>)} */}
                            {browsingUser && showMessageBox && renderChat}
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
                        {!this.state.editBitMap.isBio &&  (
                                 <div style={{display: getCookie()  ? 'block' : 'none'}}
                                    className="edit-icon"
                                    onClick={() =>
                                        // setIsEditingBio, set edit bio
                                    }
                                ><FiEdit />
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
    );
}

document.addEventListener("DOMContentLoaded", async (event) => {

    let username = window.location.pathname.split('/').pop();
    const freelancer = await getFreelancerProfile(username || "");

    ReactDOMClient.createRoot(
        document.getElementById("freelancer-profile")!
    ).render(<Profile freelancer={freelancer} />);
});
