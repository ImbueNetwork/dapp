import React, {useState} from "react";
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
import { Freelancer, Item } from "../../models";
import { getFreelancerProfile, updateFreelancer } from "../../services/freelancerService";
import { Freelancers } from "./new";
import { FreelancerSocial} from "./freelancer_socials";

export type ProfileProps = {};
export type ProfileState = {
    isEditingBio: boolean;
    userInfo: UserInfo;
    showMessageForm: boolean,
    bioEdit: string;
};

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
            <form onSubmit={handleSubmit}>
                <label htmlFor="subject">Subject</label>
                <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    style={{ marginBottom: '10px' }} 
                />
                <label htmlFor="body">Message</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    style={{ marginBottom: '20px' }} 
                />
                <button type="submit" value="submit" style={{ marginTop: '10px' }}>Submit</button> 
            </form> 
        </div>
    );
};

  

export class Profile extends React.Component<ProfileProps, ProfileState> {
    onSaveBio = async() => {
        let freelancer = this.state.userInfo.freelancer;
        let input = document.getElementById("bio-input-id") as HTMLTextAreaElement;
        freelancer.bio = input.textContent || "";
        let updated_freelancer = await updateFreelancer(
            freelancer
        );
        this.setState({
            userInfo: {
                ...this.state.userInfo,
                freelancer: updated_freelancer,
            },
            isEditingBio: false,
            bioEdit: freelancer.bio 
        });
    };

    constructor(props) {
        super(props);
        this.state = 
            {
                showMessageForm: false,
                isEditingBio : false,
                bioEdit : "",
                userInfo: {
                    freelancer: {
                        id: 0,
                        bio: "",
                        education: "",
                        experience: "",
                        facebook_link: "",
                        twitter_link: "",
                        telegram_link: "",
                        discord_link: "",
                        freelanced_before: "",
                        freelancing_goal: "",
                        work_type: "",
                        title: "",
                        skills: [],
                        languages: [],
                        services: [],
                        clients: [],
                        client_images: [],
                        display_name: "",
                        username: "",
                        user_id: 0,
                        rating: 0,
                        num_ratings: 0,
                        profileImageUrl: "/public/profile-image.png",
                    },
                    location: {country: "", address: ""},
                    portfolio: [],
                    projects: []
            }
        };
      }
    


    async componentDidMount() {
        let username = window.location.pathname.split('/').pop();
        const freelancer = await getFreelancerProfile(username || "");

        if (freelancer) {
            if (freelancer.profileImageUrl == undefined || "") {
                freelancer.profileImageUrl = "/public/profile-image.png";
            }
            await this.populateProfile({
                freelancer: freelancer,
                location: {
                    country: "",
                    address: "",
                },
                portfolio: [],
                projects: [],
                
            })
        } else {
            console.log("404")
            //404
        }
    }

    async populateProfile(info: UserInfo) {
        this.setState({
            isEditingBio: false,
            bioEdit: info.freelancer.bio,
            userInfo: info,            
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
                                src={userInfo.freelancer.profileImageUrl}
                                alt=""
                            />
                        </div>
                        <div className="profile-summary">
                            <h5>{userInfo.freelancer.display_name}</h5>
                            <div className="location">
                                <ReactCountryFlag
                                    countryCode={userInfo.location.country}
                                />
                                <p>{userInfo.location.address}</p>
                            </div>
                            <div className="rating">
                                    {
                                        Array.from({ length: userInfo.freelancer.rating || 0}, (_, i) => i).map((i) => (
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
                            </div>
                            <div className="contact">
                                <p>@{userInfo.freelancer.username}</p>
                                <IoPeople
                                    color="var(--theme-secondary)"
                                    size="24px"
                                />
                                <p>{userInfo.freelancer.title}</p>
                            </div>
                            <div className="connect-buttons">
                                <button onClick={() => this.setState({ showMessageForm: true })} className="message">Message</button>
                                {this.state.showMessageForm && (<MessageForm recipient={userInfo.freelancer.display_name} onClose={() => this.setState({ showMessageForm: false })} /> )}
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
                                            bioEdit: userInfo.freelancer.bio,
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
                                    id="bio-input-id"
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
                                {this.state.userInfo.freelancer.bio
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
                                                icon: <FaFacebook/>,
                                                link: this.state.userInfo.freelancer.facebook_link,
                                            })
                                        }{
                                            FreelancerSocial({
                                                label: "Twitter",
                                                key: "twitter",
                                                icon: <FaTwitter/>,
                                                link: this.state.userInfo.freelancer.twitter_link,
                                            })
                                        }{                                  
                                            FreelancerSocial({
                                                label: "Telegram",
                                                key: "telegram",
                                                icon: <FaTelegram/>,
                                                link: this.state.userInfo.freelancer.telegram_link,
                                            })
                                        }{
                                            FreelancerSocial({
                                                label: "Discord",
                                                key: "discord",
                                                icon: <FaDiscord/>,
                                                link: this.state.userInfo.freelancer.discord_link,
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
                                        {userInfo.freelancer.skills?.map(
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
