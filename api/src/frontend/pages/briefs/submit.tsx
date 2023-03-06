import React, { JSXElementConstructor, useState } from "react";
import ReactDOMClient from "react-dom/client";
import "../../../../public/submit-proposal.css";
import { RiShieldUserLine } from "react-icons/ri";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "../../components/milestoneItem";
import { timeData } from "../../config/briefs-data";
import { Milestones } from "../../components/milestones";
import * as config from "../../config";
import { Brief } from "../../models";
import { getBrief } from "../../services/briefsService";

interface MilestoneItem {
    description: string;
    amount: number | undefined;
}

export type BriefProps = {
    brief: Brief;
};

export const SubmitProposal = ({ brief: brief }: BriefProps): JSX.Element => {
    const [headline, setHeadline] = useState(brief.headline);
    const [description, setDescription] = useState(brief.description);
    const [budget, setDBudget] = useState(brief.budget);
    const [logo, setLogo] = useState("test");
    const [website, setWebsite] = useState("test2");
    const [category, setCategory] = useState("finance");
    const [currency_id, setCurrencyId] = useState("DOT");
    const [owner, setOwner] = useState("Hari");
    const [milestones, setMilestones] = useState<MilestoneItem[]>([
        { description: "", amount: undefined },
    ]);

    const networks = [
        {
            label: "Ethereum",
            value: "ethereum",
        },
        {
            label: "Binance",
            value: "binance",
        },
        {
            label: "Polkadot",
            value: "polkadot",
        },
        {
            label: "Kusama",
            value: "kusama",
        },
    ];

    const durationOptions = timeData.sort((a, b) =>
        a.value > b.value ? 1 : a.value < b.value ? -1 : 0
    );

    const totalBudget = milestones.reduce(
        (acc, { amount }) => acc + (amount ?? 0),
        0
    );

    const onAddMilestone = () => {
        setMilestones([...milestones, { description: "", amount: undefined }]);
    };

    const getAPIHeaders = {
        accept: "application/json",
    };
    
    const postAPIHeaders = {
        ...getAPIHeaders,
        "content-type": "application/json",
    };

    async function insertProject () {

        const resp = await fetch(`${config.apiBase}/projects/`, {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify({
                headline,
                logo,
                description,
                website,
                category,
                budget,
                currency_id,
                owner,
                milestones,
            }),
        });

        if (resp.ok) {
            // could be 200 or 201
            // Brief API successfully invoked
            console.log("Brief created successfully via Brief REST API");
        } else {
            console.log("Failed to submit the brief");
        }

    };

    return (
        <div className="application-container">
            <div className="section">
                <h3 className="section-title">Job description</h3>
                <div className="container brief-info">
                    <div className="description">
                        <div className="brief-title">
                            <h3>
                                {/*brief title */}Product Development Engineer
                            </h3>
                            <h3 className="clickable-text">View job posting</h3>
                        </div>
                        <div className="text-inactive">
                            How can you help a potential buyer can't 'hold' your
                            products online? Help your reader imagine what it
                            would be like to own your NFT. Use words that
                            describe what what your NFT is about and how owning
                            it will elicit a certain feeling..........How can
                            you help a potential buyer can't 'hold' your
                            products online? Help your reader imagine what it
                            would be like to own your NFT. U
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
                            <FaDollarSign
                                color="var(--theme-white)"
                                size={24}
                            />
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
                                <div className="text-inactive">
                                    Project length
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <h3 className="section-title">Milestones</h3>
                <div className="container milestones">
                    <div className="milestone-header">
                        <h3>Client's budget: $35,000</h3>
                    </div>
                    <h3>How many milestone do you want to include?</h3>
                    <div className="milestone-list">
                        {milestones.map(({ description, amount }, index) => {
                            const percent = `${(
                                (100 * (amount ?? 0)) /
                                totalBudget
                            ).toFixed(0)}%`;
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
                                                value={description}
                                                onChange={(e) =>
                                                    setMilestones([
                                                        ...milestones.slice(
                                                            0,
                                                            index
                                                        ),
                                                        {
                                                            ...milestones[
                                                                index
                                                            ],
                                                            description:
                                                                e.target.value,
                                                        },
                                                        ...milestones.slice(
                                                            index + 1
                                                        ),
                                                    ])
                                                }
                                            />
                                        </div>
                                        <div className="budget-wrapper">
                                            <h3>Amount</h3>
                                            <input
                                                type="number"
                                                className="input-budget"
                                                value={amount || ""}
                                                onChange={(e) =>
                                                    setMilestones([
                                                        ...milestones.slice(
                                                            0,
                                                            index
                                                        ),
                                                        {
                                                            ...milestones[
                                                                index
                                                            ],
                                                            amount: Number(
                                                                e.target.value
                                                            ),
                                                        },
                                                        ...milestones.slice(
                                                            index + 1
                                                        ),
                                                    ])
                                                }
                                            />
                                            {totalBudget !== 0 && (
                                                <div className="progress-container">
                                                    <div className="progress-value">
                                                        {percent}
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                width: percent,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <h3
                        className="clickable-text btn-add-milestone"
                        onClick={onAddMilestone}
                    >
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
                        <div className="budget-value">
                            ${totalBudget.toFixed(2)}
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
                            ${((totalBudget * 5) / 100).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <h3 className="section-title">Payment terms</h3>
                <div className="container payment-details">
                    <div className="duration-selector">
                        <h3>How long will this project take?</h3>
                        <select
                            name="duration"
                            placeholder="Select a duration"
                            required
                        >
                            {durationOptions.map(({ label, value }, index) => (
                                <option
                                    value={value}
                                    key={index}
                                    className="duration-option"
                                >
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="payment-options">
                        <div className="network-amount">
                            <select
                                name="network"
                                placeholder="Select a network"
                                required
                            >
                                {networks.map(({ label, value }, index) => (
                                    <option
                                        value={value}
                                        key={index}
                                        className="duration-option"
                                    >
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <input type="text" placeholder="Fund Required" />
                        </div>
                        <input type="text" className="wallet-address" />
                    </div>
                </div>
            </div>
            <div className="buttons-container">
            <button
                            className="primary-btn in-dark w-button"
                            onClick={() => insertProject()}
                        >
                            Submit
                        </button>
                <button className="secondary-btn">Save draft</button>
            </div>
        </div>
    );
};
document.addEventListener("DOMContentLoaded", async (event) => {
    let briefId = window.location.pathname.split("/").pop();

    if (briefId) {
        const brief: Brief = await getBrief(briefId);
        console.log(brief);
        ReactDOMClient.createRoot(
            document.getElementById("submit-proposal")!
        ).render(<SubmitProposal brief={brief} />);
    }

});
