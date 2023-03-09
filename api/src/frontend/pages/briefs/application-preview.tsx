import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import "../../../../public/application-preview.css";
import { FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "../../components/milestoneItem";
import { timeData } from "../../config/briefs-data";
import * as config from "../../config";
import { Brief, Currency, Project, User } from "../../models";
import { getBrief } from "../../services/briefsService";
import { BriefInsights } from "../../components";
import { fetchProject, getCurrentUser, getProjectId, redirect } from "../../utils";

interface MilestoneItem {
    name: string;
    amount: number | undefined;
}

export type ApplicationPreviewProps = {
    brief: Brief;
    user: User;
    application: Project;
};

export const ApplicationPreview = ({ brief, user, application }: ApplicationPreviewProps): JSX.Element => {
    const imbueFee = application.imbue_fee?.toLocaleString();
    const totalCostWithoutFee = application.total_cost_without_fee?.toLocaleString();
    const totalCost = application.required_funds.toLocaleString();
    const viewFullBrief = () => {
        redirect(`briefs/${brief.id}`);
    };

    return (
        <div className="application-container">
            <div className="section">
                <h3 className="section-title">Job description</h3>
                <BriefInsights brief={brief} />
            </div>
            <div className="section">
                <h3 className="section-title">Milestones</h3>
                <div className="container milestones">
                    <div className="milestone-header">
                        <h3>Client's budget: ${Number(brief.budget).toLocaleString()}</h3>
                    </div>
                    <h3>How many milestone do you want to include?</h3>
                    <div className="milestone-list">
                        {application.milestones.map(({ name, percentage_to_unlock, amount }, index) => {
                            return (
                                <div className="milestone-row" key={index}>
                                    <div className="milestone-no">
                                        {index + 1}
                                    </div>
                                    <div className="input-wrappers">
                                        <div className="description-wrapper">
                                            <h3>Description</h3>
                                            <textarea
                                                className="input-description"
                                                value={name}
                                                disabled
                                            />
                                        </div>
                                        <div className="budget-wrapper">
                                            <h3>Amount</h3>
                                            <p
                                                type="number"
                                                className="input-budget"
                                                // value={percentage_to_unlock * Number(application.total_cost_without_fee)}
                                                value={amount}
                                            />
                                                <div className="progress-container">
                                                    <div className="progress-value">
                                                        {percentage_to_unlock}%
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                width: `${percentage_to_unlock}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <hr className="separator" />
                    <div className="budget-info">
                        <div className="budget-description">
                            <h3>Total price of the project</h3>
                            <div className="text-inactive">
                                This includes all milestonees, and is the amount
                                client will see
                            </div>
                        </div>
                        <div className="budget-value">
                            ${totalCostWithoutFee}
                        </div>
                    </div>
                    <hr className="separator" />
                    <div className="budget-info">
                        <div className="budget-description">
                            <h3>
                                Imbue Service Fee 5% - Learn more about Imbue’s
                                fees
                            </h3>
                        </div>
                        <div className="budget-value text-inactive">
                            ${imbueFee}
                        </div>
                    </div>

                    <hr className="separator" />
                    <div className="budget-info">
                        <div className="budget-description">
                            <h3>Total</h3>
                        </div>
                        <div className="budget-value text-inactive">
                            ${totalCost}
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <h3 className="section-title">Payment terms</h3>
                <div className="container payment-details">
                    <div className="duration-selector">
                        <h3>How long will this project take?</h3>
                        <p>{brief.duration}</p>
                    </div>
                    <div className="payment-options">
                        <h3>Currency</h3>

                        <div className="network-amount">
                            <p>${Currency[application.currency_id]}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="buttons-container">
                <button
                    className="primary-btn in-dark w-button"
                    onClick={() => viewFullBrief()}
                >
                    Back To Brief
                </button>
            </div>
        </div>
    );
};
document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 4]);
    let applicationId = paths.length >= 2 && parseInt(paths[paths.length - 2]);
    if (briefId && applicationId) {
        const brief: Brief = await getBrief(briefId);
        const application = await fetchProject(applicationId);
        const user = await getCurrentUser();
        ReactDOMClient.createRoot(
            document.getElementById("application-preview")!
        ).render(<ApplicationPreview brief={brief} user={user} application={application} />);
    }
    // TODO 404 page when brief of application is not found
});
