import React from "react";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import { Brief } from "../models";
import "../../../public/submit-proposal.css"; // TODO: update css
import { redirect } from "../utils";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

interface BriefInsightsProps {
    brief: Brief;
}
TimeAgo.addDefaultLocale(en);

export const BriefInsights = ({ brief }: BriefInsightsProps) => {
    const timeAgo = new TimeAgo("en-US");
    const timePosted = timeAgo.format(new Date(brief.created));

    const viewFullBrief = () => {
        redirect(`briefs/${brief.id}/`);
    };

    return (
        <div className="container brief-info">
            <div className="description">
                <div className="brief-title">
                    <h3>{brief.headline }</h3>
                    <h3 className="clickable-text" onClick={viewFullBrief}>
                        View full brief
                    </h3>
                </div>
                <div className="text-inactive">
                    <p>{brief.description}</p>
                </div>
                <div className="text-inactive">Posted {timePosted} </div>
            </div>
            <div className="insights">
                <div className="insight-item">
                    <RiShieldUserLine color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>{brief.experience_level}</h3>
                        <div className="text-inactive">Experience Level</div>
                    </div>
                </div>
                <div className="insight-item">
                    <FaDollarSign color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>${Number(brief.budget).toLocaleString()}</h3>
                        <div className="text-inactive">Fixed Price</div>
                    </div>
                </div>
                <div className="insight-item">
                    <FaRegCalendarAlt color="var(--theme-white)" size={24} />
                    <div className="insight-value">
                        <h3>{brief.duration}</h3>
                        <div className="text-inactive">Project length</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
