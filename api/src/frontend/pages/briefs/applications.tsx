import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import ReactCountryFlag from "react-country-flag";
import { FaPaperclip, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { Brief, Project, User } from "../../models";
import { getBrief, getBriefApplications } from "../../services/briefsService";
import { BriefInsights, ChatBox } from "../../components";
import 'bootstrap/dist/css/bootstrap.min.css';

import "../../../../public/brief-applications.css";
import { fetchUser, getCurrentUser, redirect } from "../../utils";
import Modal from 'react-bootstrap/Modal';

interface BriefApplicationsProps {
    brief: Brief;
    browsingUser: User;
}
export const BriefApplications = ({ brief, browsingUser }: BriefApplicationsProps) => {
    const [briefApplications, setBriefApplications] = useState<any[]>();
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);

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

    const handleMessageBoxClick = async (user_id) => {
        if (browsingUser) {
            setTargetUser(await fetchUser(user_id));
            setShowMessageBox(true);
        } else {
            redirect("login", `/dapp/briefs/${brief.id}/`)
        }
    }

    useEffect(() => {
        async function setup() {
            if (brief.id) {
                setBriefApplications(await getBriefApplications(brief.id))
            }
        }
        setup();
    }, [])

    const redirectToApplication = (applicationId) => {
        redirect(`briefs/${brief.id}/applications/${applicationId}/`);
    };

    return (
        <div className="page-wrapper">
            {browsingUser && showMessageBox && renderChat}

            <div className="section">
                <h3 className="section-title">Review proposals</h3>
                <BriefInsights brief={brief} />
            </div>
            <div className="section">
                <h3 className="section-title">All applicants</h3>
                <div className="applicants-list">
                    {briefApplications?.map((application, index) => (
                        <div className="applicant-wrapper" key={index}>
                            <img
                                src="/public/profile-image.png"
                                className="freelancer-profile-pic"
                            />
                            <div className="application-wrapper">
                                <div className="freelancer-info">
                                    <div className="user-id text-primary">
                                        @{application.freelancer.username}
                                    </div>
                                    {/* <div className="country">
                                        <div className="country-flag">
                                            <ReactCountryFlag countryCode="us" />
                                        </div>
                                        <div className="country-name text-grey">
                                            United States
                                        </div>
                                    </div> */}
                                </div>
                                <div className="select-freelancer">
                                    <div className="freelancer-title">
                                        {application.freelancer.title}
                                    </div>
                                    {/* TODO: Implement total earned */}
                                    {/* <div className="flex-row freelancer-earn">
                                        <div className="text-grey">
                                            $230000.00+
                                        </div>
                                        <div className="text-primary text-small">
                                            earned
                                        </div>
                                    </div> */}

                                    <div className="ctas-container">
                                        <div className="cta-votes">
                                            <div className="cta-vote">
                                                <FaRegThumbsUp />
                                                Yes
                                            </div>
                                            <div className="cta-vote">
                                                <FaRegThumbsDown />
                                                No
                                            </div>
                                        </div>
                                        <button className="primary-btn in-dark w-button" onClick={() => redirectToApplication(application.id)}>
                                            View proposal
                                        </button>
                                        <button onClick={() => handleMessageBoxClick(application.user_id)} className="secondary-btn in-dark w-button">
                                            Message
                                        </button>
                                    </div>
                                </div>
                                <div className="cover-letter">
                                    <div>
                                        {application.freelancer.bio
                                            .split("\n")
                                            .map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                    </div>
                                </div>
                                <div className="flex-row justify-between">
                                    <div className="attachment">
                                        {/* <h3>Attachment(s)</h3> */}
                                        <div className="flex-row">
                                            {/* TODO: Implement */}

                                            {/* <FaPaperclip />
                                            <div className="text-grey text-small">
                                                https://www.behance.net/abbioty
                                            </div> */}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-primary">
                                            Milestones({application.milestones.length})
                                        </div>
                                        <div className="text-small text-grey">
                                            ${Number(application.required_funds).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* TODO Display empty if no applications */}
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 2]);

    if (briefId) {
        const brief: Brief = await getBrief(briefId);
        const browsingUser = await getCurrentUser();
        const isBriefOwner = brief.user_id == browsingUser.id;
        if (isBriefOwner) {
            ReactDOMClient.createRoot(
                document.getElementById("brief-applications")!
            ).render(<BriefApplications brief={brief} browsingUser={browsingUser} />);
        } else {
            redirect(`briefs/${briefId}/`)
        }

    }
});
