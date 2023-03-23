import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Brief } from "../../models";
import { getBrief } from "../../services/briefsService";
import { getCurrentUser, redirect } from "../../utils";
import "../../../../public/brief-dashboard.css";
import { RiShieldUserLine } from "react-icons/ri";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { ProjectState } from "../../models";

interface BriefDashboardProps {
    brief: Brief;
}

TimeAgo.addDefaultLocale(en);

export const BriefDashboard = ({ brief }: BriefDashboardProps) => {
    const timeAgo = new TimeAgo("en-US");
    const timePosted = timeAgo.format(new Date(brief.created));
    const milestonecompleted = 2;

    const viewFullBrief = () => {
        redirect(`briefs/${brief.id}/`);
    };

    const milestones = [
        {
            name: "C++ Network Experts for banking app",
            date: "25 February 2023",
            percentToRelease: "45%",
            fundToRelease: "$45,000",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus",
            status: "Completed",
        },
        {
            name: "C++ Network Experts for banking app",
            date: "25 February 2023",
            percentToRelease: "45%",
            fundToRelease: "$45,000",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus",
            status: "Open for Voting",
        },
        {
            name: "C++ Network Experts for banking app",
            date: "25 February 2023",
            percentToRelease: "45%",
            fundToRelease: "$45,000",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus",
            status: "In Progress",
        },
        {
            name: "C++ Network Experts for banking app",
            date: "25 February 2023",
            percentToRelease: "45%",
            fundToRelease: "$45,000",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus",
            status: "Not Started",
        },
    ];

    const [milestoneVisible, showMilestone] = useState({});

    const toggleMilestone = (index: number) => {
        const current = milestoneVisible[index] || false;
        showMilestone({ ...milestoneVisible, [index]: !current });
    };

    return (
        <>
            <div className="brief-info-wrapper container">
                <div className="brief-info">
                    <div className="description">
                        <div className="brief-title">
                            <h2 className="text-3xl">{brief.headline}</h2>
                            <h3
                                className="clickable-text"
                                onClick={viewFullBrief}
                            >
                                View full brief
                            </h3>
                        </div>
                        <div className="text-inactive">
                            <p>{brief.description}</p>
                        </div>
                        <div className="text-inactive">
                            Posted {timePosted}{" "}
                        </div>
                    </div>
                    <div className="insights">
                        <div className="insight-item">
                            <RiShieldUserLine
                                color="var(--theme-white)"
                                size={24}
                            />
                            <div className="insight-value milestone">
                                <h3>Milestone</h3>
                                <span className="milestones-complete font-sans text-xl">
                                    2/4
                                </span>
                            </div>
                        </div>
                        <div className="milestone-progress-indicator">
                            <div
                                className="milestone-complete"
                                style={{ width: "50%" }}
                            >
                            </div>
                            <div className="flex -mt-1.5 justify-evenly">
                                    {milestones.map((milestone, index) => (
                                        <div className={`h-4 w-4 rounded-full ${milestonecompleted>=(index+1)?"bg-[#b2ff0b]" :"bg-[#1c2608]"} `}></div>
                                    ))}
                                </div>
                            {/* <div className="milestone-complete-percentage">
                                50%
                            </div> */}
                        </div>
                        <div className="insight-item">
                            <FaDollarSign
                                color="var(--theme-white)"
                                size={24}
                            />
                            <div className="insight-value">
                                <h3 className="font-sans">
                                    ${Number(brief.budget).toLocaleString()}
                                </h3>
                                <div className="text-inactive">
                                    Budget - fixed
                                </div>
                            </div>
                        </div>
                        <div className="insight-item">
                            <FaRegCalendarAlt
                                color="var(--theme-white)"
                                size={24}
                            />
                            <div className="insight-value">
                                <h3 className="font-sa">{brief.duration}</h3>
                                <div className="text-inactive">Timeline</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="freelancer-info">
                    <h3>Freelancer Hired</h3>
                    <div className="freelancer-profile">
                        <img
                            src="/public/profile-image.png"
                            className="freelancer-profile-pic"
                        />
                        <h3>Idris Muhammad</h3>
                        <button className="primary-btn w-button in-dark">
                            Message
                        </button>
                    </div>
                </div>
            </div>
            <div className="milestones-container">
                {milestones.map((m, index) => (
                    <div className="milestone-item container" key={index}>
                        <div className="milestone-header">
                            <div className="milestone-no">
                                {`Milestone ${index + 1}`}
                            </div>
                            <h3 className="milestone-name mt-auto">{m.name}</h3>
                            <div className="milestone-date">{m.date}</div>
                            <div
                                className={`milestone-status ${
                                    m.status === "Open for Voting"
                                        ? "text-primary"
                                        : "text-secondary"
                                }`}
                            >
                                {m.status}
                            </div>
                            <button
                                className="primary-btn in-dark w-button toggle"
                                onClick={() => toggleMilestone(index)}
                            >
                                {milestoneVisible[index] ? "-" : "+"}
                            </button>
                        </div>
                        {milestoneVisible[index] && (
                            <div className="milestone-details">
                                <div className="milestone-release-info">
                                    <span>
                                        Percentage of funds to be released
                                    </span>{" "}
                                    <span className="text-primary">
                                        {m.percentToRelease}
                                    </span>
                                </div>
                                <div className="milestone-release-info">
                                    <span>Funding to be released</span>{" "}
                                    <span className="text-primary">
                                        {m.fundToRelease}
                                    </span>
                                </div>
                                <div className="milestone-description">
                                    {m.description}
                                </div>
                                <div>
                                    <button className="primary-btn w-button in-dark vote">
                                        Vote
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 2]);
    const user = await getCurrentUser();

    if (briefId) {
        const brief: Brief = await getBrief(briefId);
        if (brief) {
            ReactDOMClient.createRoot(
                document.getElementById("brief-dashboard")!
            ).render(<BriefDashboard brief={brief} />);
        }
    }
});
