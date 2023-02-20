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
import { getFreelancerProfile } from "../../services/freelancerService";
import { Freelancer } from "../../models";
import { Freelancers } from "./new";
import { FreelancerSocial} from "./freelancer_socials";

export type ProfileProps = {};
export type ProfileState = {
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

type MessageFormProps = {
    recipient: string;
    onClose: () => void;
};

// const [showMessageForm, setShowMessageForm] = useState(false);


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
          />
          <label htmlFor="body">Message</label>
          <textarea
            id="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    );
};
  

export class Profile extends React.Component<ProfileProps, ProfileState> {
    onSaveBio = () => {
        //this.setState({
        //});
    };
    
    constructor(props) {
        super(props);
        this.state = 
            {
                is_found: false,
                showMessageForm: false,
                isEditingBio : false,
                bioEdit : "",
                userInfo: {
                    profileImageUrl: "/public/profile-image.png",
                    rating: {
                        stars: 5,
                        level: "",
                        numReviews: 0
                    },
                    location: {country: "", address: ""},
                    contact: {username: "", title: "" },
                    name: "",
                    skills: [],
                    bio: "",
                    socials: {facebook: "", discord: "", twitter: "", telegram: ""}
            }
        };
      }
    


    async componentDidMount() {
        let username = window.location.pathname.split('/').pop();
        const freelancer = await getFreelancerProfile(username || "");
        if (freelancer) {
            await this.populateProfile(freelancer)
        } else {
            //404
        }
    }

    async populateProfile(freelancer: Freelancer) {
        this.setState({
            is_found: true,
            isEditingBio : false,
            bioEdit : freelancer.bio,
            userInfo: {
                //todo
                profileImageUrl: "/public/profile-image.png",
                rating: {
                    stars:  5,
                    level: "default",
                    numReviews: 0
                },
                // todo
                location: {country: "", address: ""},
                contact: {username: freelancer.username, title: freelancer.title },
                name: freelancer.display_name,
                skills: freelancer.skills,
                bio: freelancer.bio,
                socials: {facebook: freelancer.facebook_link, discord: freelancer.discord_link, twitter: freelancer.twitter_link, telegram: freelancer.telegram_link}
            },
        });
    }

    get_stars(num_stars: number) {
        
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
                                alt=""
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
                                    {
                                        Array.from({ length: userInfo.rating.stars}, (_, i) => i).map((i) => (
                                            <p key={i}><FaStar color="var(--theme-yellow)" /></p> 
                                        ))
                                    }
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
                                <button onClick={() => this.setState({ showMessageForm: true })} className="message">Message</button>
                                {this.state.showMessageForm && (<MessageForm recipient={userInfo.name} onClose={() => this.setState({ showMessageForm: false })} /> )}
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
                                        {
                                            FreelancerSocial({
                                                label: "Facebook",
                                                key: "facebook",
                                                icon: <FaFacebook/>,
                                                link: this.state.userInfo.socials.facebook,
                                            })
                                        }{
                                            FreelancerSocial({
                                                label: "Twitter",
                                                key: "twitter",
                                                icon: <FaTwitter/>,
                                                link: this.state.userInfo.socials.twitter,
                                            })
                                        }{                                  
                                            FreelancerSocial({
                                                label: "Telegram",
                                                key: "telegram",
                                                icon: <FaTelegram/>,
                                                link: this.state.userInfo.socials.telegram,
                                            })
                                        }{
                                            FreelancerSocial({
                                                label: "Discord",
                                                key: "discord",
                                                icon: <FaDiscord/>,
                                                link: this.state.userInfo.socials.discord,
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
