import React from "react";
import ReactDOMClient from "react-dom/client";
import ReactCountryFlag from "react-country-flag";
import { FaPaperclip, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { Brief } from "../../models";
import { getBrief } from "../../services/briefsService";
import { BriefInsights } from "../../components";
import "../../../../public/brief-applications.css";

interface BriefApplicationsProps {
    brief: Brief;
}
export const BriefApplications = ({ brief }: BriefApplicationsProps) => {
    return (
        <div className="page-wrapper">
            <div className="section">
                <h3 className="section-title">Review proposals</h3>
                <BriefInsights brief={brief} />
            </div>
            <div className="section">
                <h3 className="section-title">All applicants</h3>
                <div className="applicants-list">
                    {[0, 1, 2].map((_, index) => (
                        <div className="applicant-wrapper" key={index}>
                            <img
                                src="/public/profile-image.png"
                                className="freelancer-profile-pic"
                            />
                            <div className="application-wrapper">
                                <div className="freelancer-info">
                                    <div className="user-id text-primary">
                                        @abbioty
                                    </div>
                                    <div className="country">
                                        <div className="country-flag">
                                            <ReactCountryFlag countryCode="us" />
                                        </div>
                                        <div className="country-name text-grey">
                                            United States
                                        </div>
                                    </div>
                                </div>
                                <div className="select-freelancer">
                                    <div className="freelancer-title">
                                        Web3 Developer
                                    </div>
                                    <div className="flex-row freelancer-earn">
                                        <div className="text-grey">
                                            $230000.00+
                                        </div>
                                        <div className="text-primary text-small">
                                            earned
                                        </div>
                                    </div>

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
                                        <button className="primary-btn in-dark w-button">
                                            View proposal
                                        </button>
                                        <button className="secondary-btn in-dark w-button">
                                            Message
                                        </button>
                                    </div>
                                </div>
                                <div className="cover-letter">
                                    <h3>Cover letter</h3>
                                    <div>
                                        Hello, I would like to help you! I have
                                        4+ years Experience with web 3, so i’ll
                                        make things work properly. Feel free to
                                        communicate!
                                    </div>
                                </div>
                                <div className="flex-row justify-between">
                                    <div className="attachment">
                                        <h3>Attachment</h3>
                                        <div className="flex-row">
                                            <FaPaperclip />
                                            <div className="text-grey text-small">
                                                https://www.behance.net/abbioty
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-primary">
                                            Milestones(3)
                                        </div>
                                        <div className="text-small text-grey">
                                            $15000.00
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 2]);

    if (briefId) {
        const brief: Brief = await getBrief(briefId);
        ReactDOMClient.createRoot(
            document.getElementById("brief-applications")!
        ).render(<BriefApplications brief={brief} />);
    }
});
