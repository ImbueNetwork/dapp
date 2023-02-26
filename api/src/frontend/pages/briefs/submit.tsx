import React from "react";
import ReactDOMClient from "react-dom/client";
import "../../../../public/submit-proposal.css";
import { RiShieldUserLine } from "react-icons/ri";
import { FaCalendar, FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";

export const SubmitProposal = () => {
    return (
        <div className="application-container">
            <div className="container brief-info">
                <div className="description">
                    <h3>Job description</h3>
                    <div className="brief-title">
                        <h3>{/*brief title */}Product Development Engineer</h3>
                        <h3 className="clickable-text">View job posting</h3>
                    </div>
                    <div className="text-inactive">
                        How can you help a potential buyer can't 'hold' your
                        products online? Help your reader imagine what it would
                        be like to own your NFT. Use words that describe what
                        what your NFT is about and how owning it will elicit a
                        certain feeling..........How can you help a potential
                        buyer can't 'hold' your products online? Help your
                        reader imagine what it would be like to own your NFT. U
                    </div>
                    <div className="text-inactive">Posted Feb 21, 2023</div>
                </div>
                <div className="insights">
                    <div className="insight-item">
                        <RiShieldUserLine
                            color="var(--theme-white)"
                            size={24}
                        />
                        <div className="insight-value">
                            <h3>Expert</h3>
                            <div className="text-inactive">
                                Experience Level
                            </div>
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
                        <FaRegCalendarAlt
                            color="var(--theme-white)"
                            size={24}
                        />
                        <div className="insight-value">
                            <h3>1 to 3 months</h3>
                            <div className="text-inactive">Project length</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container milestones">
                <div className="milestone-header">
                    <h3>Milestones</h3>
                    <h3>Client's budget: $35,000</h3>
                </div>
                <h3>How many milestone do you want to include?</h3>
                <div className="milestone-list">
                    <div className="milestone-row">
                        <div className="milestone-no">1</div>
                        <div className="input-wrappers">
                            <div className="value-input">
                                <h3>Description</h3>
                                <input
                                    type="text"
                                    className="input-description"
                                />
                            </div>
                            <div className="value-input">
                                <h3>Amount</h3>
                                <input type="text" className="input-budget" />
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{ width: "20%" }}
                            ></div>
                        </div>
                    </div>
                </div>
                <h3 className="clickable-text btn-add-milestone">
                    <FiPlusCircle color="var(--theme-primary)" />
                    Add milestone
                </h3>
                <hr className="separator" />
                <div className="budget-info">
                    <div className="budget-description">
                        <h3>Total price of the project</h3>
                        <div className="text-inactive">
                            This includes all milestonees, and is the amount
                            client will see
                        </div>
                    </div>
                    <div className="budget-value">$22,250.00</div>
                </div>
                <hr className="separator" />
                <div className="budget-info">
                    <div className="budget-description">
                        <h3>
                            Imbue Service Fee 5% - Learn more about Imbue’s fees
                        </h3>
                    </div>
                    <div className="budget-value text-inactive">$1,750.00</div>
                </div>
            </div>
            <div className="container payment-details">
                <div className="duration-selector">
                    <h3>How long will this project take?</h3>
                    <input className="" />
                </div>
                <div className="payment-options">
                    <div className="network-amount">
                        <input type="text" placeholder="Ethereum" />
                        <input type="text" placeholder="Funds Required" />
                    </div>
                    <input type="text" className="wallet-address" />
                </div>
            </div>
            <div className="container buttons-container">
                <div className="btn-submit">Submit cover letter</div>
                <div className="btn-submit">
                    Drag or upload support documents
                </div>
            </div>
        </div>
    );
};
document.addEventListener("DOMContentLoaded", async (event) => {
    ReactDOMClient.createRoot(
        document.getElementById("submit-proposal")!
    ).render(<SubmitProposal />);
});
