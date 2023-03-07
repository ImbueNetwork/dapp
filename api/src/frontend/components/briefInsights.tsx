import React from "react";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import { Brief } from "../models";
import "../../../public/submit-proposal.css"; // TODO: update css

interface BriefInsightsProps {
    brief: Brief;
}

export const BriefInsights = ({ brief }: BriefInsightsProps) => {
    const viewFullBrief = () => {
        // TODO:
    };
    return (
        <div className="container brief-info">
            <div className="description">
                <div className="brief-title">
                    <h3>{/*brief title */}Product Development Engineer</h3>
                    <h3 className="clickable-text" onClick={viewFullBrief}>
                        View full brief
                    </h3>
                </div>
                <div className="text-inactive">
                    How can you help a potential buyer can't 'hold' your
                    products online? Help your reader imagine what it would be
                    like to own your NFT. Use words that describe what what your
                    NFT is about and how owning it will elicit a certain
                    feeling..........How can you help a potential buyer can't
                    'hold' your products online? Help your reader imagine what
                    it would be like to own your NFT. U
                </div>
                <div className="text-inactive">Posted Feb 21, 2023</div>
            </div>
            <div className="insights">
                <div className="insight-item">
                    <RiShieldUserLine color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>Expert</h3>
                        <div className="text-inactive">Experience Level</div>
                    </div>
                </div>
                <div className="insight-item">
                    <FaDollarSign color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>Proposed your terms</h3>
                        <div className="text-inactive">Fixed Price</div>
                    </div>
                </div>
                <div className="insight-item">
                    <FaRegCalendarAlt color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>1 to 3 months</h3>
                        <div className="text-inactive">Project length</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
