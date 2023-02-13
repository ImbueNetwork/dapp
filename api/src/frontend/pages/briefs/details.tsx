import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Brief, Freelancer, User } from "../../models";
import { TagsInput } from "../../components/tagsInput";
import * as utils from "../../utils";
import "../../../../public/brief-details.css";
import { Briefs } from ".";
import { getBrief } from "../../services/briefsService";
import "../../../../public/freelancer-profile.css";


export type BriefProps = {
    brief: Brief;
};

export const BriefDetails = ({ brief: brief }: BriefProps): JSX.Element => {


    const BioPanel = (
        <div className="brief-bio">
            <div className="subsection">
                <div className="header">
                    <h3>{brief.headline}</h3>
                </div>

                <span className="posted-date">Posted 5 days ago by {brief.created_by}</span>
            </div>

            <div className="subsection">
                <div className="action-buttons">
                    <button className="primary-btn in-dark w-button">Apply</button>
                    <button className="primary-btn in-dark w-button">Save</button>
                </div>
            </div>
            <div className="subsection">
                <h3>Project Description</h3>
                <p>
                    {brief.description}
                </p>
            </div>

            <div className="subsection">
                <div className="header">
                    <h3>Project Category</h3>
                </div>
                <div className="skills">
                    {brief.skills?.map(
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

            <div className="subsection">
                <div className="header">
                    <h3>Total Budget</h3>
                </div>
                <span>${Number(brief.budget).toLocaleString()}</span>
            </div>

            <div className="subsection">
                <div className="header">
                    <h3>Key Skills And Requirements</h3>
                </div>
                <ul>
                    <li>Create user interface designs for desktop based applications and cloud services for a technical audience.</li>
                    <li>Develop design prototypes for testing with users.</li>
                    <li>Work with Product and Engineering to create new products or improve existing products based on user research and customer feedback.</li>
                    <li>Conduct usability surveys and research to identify areas of improvement for existing products or new product ideas.</li>
                    <li>Collaborate with engineering to ensure designs can be effectively implemented in code.</li>
                </ul>
            </div>

            <div className="subsection">
                <div className="header">
                    <h3>Project Scope</h3>
                </div>
                <span>{brief.scope}</span>
            </div>

            <div className="subsection">
                <div className="header">
                    <h3>Experience Level Required</h3>
                </div>
                <span>{brief.experience_level}</span>
            </div>

            <div className="subsection">
                <div className="header">
                    <h3>Estimate Project/Contract Length</h3>
                </div>
                <span>{brief.duration}</span>
            </div>

        </div>
    );

    const BioInsights = (
        <div className="brief-insights">

            <div className="subsection">
                <div className="brief-insights-stat">
                    <h3>Brief Insights</h3>
                </div>
            </div>

            <div className="subsection">
                <div className="brief-insights-stat">
                    <i className="material-icons" aria-hidden="true" >dynamic_feed</i>
                    <h3> <span>{brief.number_of_briefs_submitted}</span> projects posted</h3>
                </div>
            </div>

            <div className="subsection">
                <div className="brief-insights-stat">
                    <i className="material-icons" aria-hidden="true" >account_balance_wallet</i>
                    <h3>Total Spent <span>$250,000</span></h3>
                </div>
            </div>

            <div className="subsection">
                <div className="brief-insights-stat">
                    <i className="material-icons" aria-hidden="true" >groups</i>
                    <h3>Applications: <span>10-20</span> </h3>
                </div>
            </div>

        </div>
    );
    return (
        <div className="brief-details-container">
            <div className="brief-info">
                {BioPanel}
                {BioInsights}
            </div>


            <div className="similar-briefs">
                <h3>Similar projects on Imbue</h3>
                <div className="divider"></div>

                <div className="similar-brief">
                    <div className="similar-brief-details">
                        <p>NFT Minting</p>
                        <span>Hi guys, I have an NFT I would like to design. The NFT has to have a picture of......</span>

                    </div>
                    <button className="primary-btn in-dark w-button">View Brief</button>
                </div>

                <div className="similar-brief">
                    <div className="similar-brief-details">
                        <p>NFT Minting</p>
                        <span>Hi guys, I have an NFT I would like to design. The NFT has to have a picture of......</span>

                    </div>
                    <button className="primary-btn in-dark w-button">View Brief</button>
                </div>

                <div className="similar-brief">
                    <div className="similar-brief-details">
                        <p>NFT Minting</p>
                        <span>Hi guys, I have an NFT I would like to design. The NFT has to have a picture of......</span>

                    </div>
                    <button className="primary-btn in-dark w-button">View Brief</button>
                </div>
            </div>
        </div>
    );
};



document.addEventListener("DOMContentLoaded", async (event) => {
    let briefId = window.location.pathname.split('/').pop();

    if (briefId) {
        const brief: Brief = await getBrief(briefId);
        ReactDOMClient.createRoot(
            document.getElementById("brief-details")!
        ).render(<BriefDetails brief={brief} />);
    }

});
