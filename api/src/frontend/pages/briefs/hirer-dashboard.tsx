import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Brief, Currency, Project, User } from "../../models";
import { getCurrentUser } from "../../utils";
import "../../../../public/hirer-dashboard.css";

export type HirerDashboardProps = {
    user: User;
};

export const HirerDashboard = ({ user }: HirerDashboardProps): JSX.Element => {

    return (
        <div className="application-container">
            <div className="section">
                <div className="container">
                    <div className="brief-info">
                        <div className="brief-description">
                            <h3>Open Briefs</h3>
                        </div>
                        <div className="brief-value">
                            <h3>Proposals</h3>
                        </div>
                    </div>
                    {[0, 1, 2].map((_, index) => (
                        <>
                            <hr className="separator" />

                            <div className="brief-info">
                                <div className="brief-description">
                                    <h3>C++ network expert for banking app</h3>
                                    <span>Budget $30,000</span>
                                    <span>Created 25 days ago</span>
                                </div>
                                <div className="brief-value">
                                    <h3>10</h3>
                                </div>
                            </div>
                        </>


                    ))}


                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="brief-info">
                        <div className="brief-description">
                            <h3>Projects</h3>
                        </div>
                    </div>
                    {[0, 1, 2].map((_, index) => (
                        <>
                            <hr className="separator" />

                            <div className="brief-info">
                                <div className="brief-description">
                                    <h3>C++ network expert for banking app</h3>
                                    <span>Budget $30,000</span>
                                    <span>Created 25 days ago</span>
                                </div>
                                <div className="project-milestones">
                                    <div className="milestone-header">
                                        <h3>Milestones</h3>
                                        <h3 className="milestones-info">2/4</h3>
                                    </div>

                                    <div className="project-progress">
                                        <div
                                            className="project-progress-indicator"
                                            style={{
                                                width: '50%',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="brief-value">
                                    <button className="primary-btn in-dark w-button">View Status</button>
                                </div>
                            </div>
                        </>


                    ))}


                </div>
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    const user = await getCurrentUser();
    if (user) {
        ReactDOMClient.createRoot(
            document.getElementById("hirer-dashboard")!
        ).render(<HirerDashboard user={user} />);
    }
});