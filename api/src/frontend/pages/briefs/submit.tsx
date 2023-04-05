import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "../../components/milestoneItem";
import { timeData } from "../../config/briefs-data";
import * as config from "../../config";
import { Brief, Currency, Project, User } from "../../models";
import { getBrief, getUserBrief } from "../../services/briefsService";
import { BriefInsights, AccountChoice } from "../../components";
import { getCurrentUser, redirect } from "../../utils";
import { getFreelancerProfile } from "../../services/freelancerService";
import "../../Styles/application-preview.css";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { selectAccount } from "../../services/polkadotService";


interface MilestoneItem {
    name: string;
    amount: number | undefined;
}

export type BriefProps = {
    brief: Brief;
    user: User;
};

export const SubmitProposal = ({ brief, user }: BriefProps): JSX.Element => {
    const [currencyId, setCurrencyId] = useState(0);
    const userHasWeb3Addresss = !!user.web3_address;
    const [showPolkadotAccounts, setShowPolkadotAccounts] = useState<boolean>(!userHasWeb3Addresss);
    const currencies = Object.keys(Currency).filter(key => !isNaN(Number(Currency[key])));
    const imbueFeePercentage = 5;

    const [milestones, setMilestones] = useState<MilestoneItem[]>([
        { name: "", amount: undefined },
    ]);

    const durationOptions = timeData.sort((a, b) =>
        a.value > b.value ? 1 : a.value < b.value ? -1 : 0
    );

    const totalCostWithoutFee = milestones.reduce(
        (acc, { amount }) => acc + (amount ?? 0),
        0
    );
    const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
    const totalCost = imbueFee + totalCostWithoutFee;


    const onAddMilestone = () => {
        setMilestones([...milestones, { name: "", amount: undefined }]);
    };

    const getAPIHeaders = {
        accept: "application/json",
    };

    const postAPIHeaders = {
        ...getAPIHeaders,
        "content-type": "application/json",
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrencyId(Number(event.target.value))
    };

    const handleSelectAccount = async (account: InjectedAccountWithMeta) => {
        await selectAccount(account);
        setShowPolkadotAccounts(false);
    };

    async function insertProject() {

        //TODO: validate all milestone sum up to 100%
        const resp = await fetch(`${config.apiBase}/projects/`, {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify({
                user_id: user.id,
                name: `Brief Application: ${brief.headline}`,
                brief_id: brief.id,
                total_cost_without_fee: totalCostWithoutFee,
                imbue_fee: imbueFee,
                currency_id: currencyId,
                milestones: milestones.filter(m => m.amount !== undefined).map(m => { return { name: m.name, amount: m.amount, percentage_to_unlock: (((m.amount ?? 0) / totalCostWithoutFee) * 100).toFixed(0) } }),
                required_funds: totalCost
            }),
        });

        if (resp.ok) {
            const applicationId = (await resp.json()).id;
            redirect(`briefs/${brief.id}/applications/${applicationId}/`)
        } else {
            console.log("Failed to submit the brief");
        }
    }

    const renderPolkadotJSModal = (
        <div>
            <AccountChoice accountSelected={(account: InjectedAccountWithMeta) => handleSelectAccount(account)} />
        </div>
    );

    return (
        <div className="application-container">
            <div className="section">
                <h3 className="section-title">Job description</h3>
                <BriefInsights brief={brief} />
            </div>
            <div className="section">
                <div className="container milestones">
                    <div className="milestone-header mx-14 -mb-3">
                        <h3 className="section-title">Milestones</h3>
                        <h3>Client's budget: ${Number(brief.budget).toLocaleString()}</h3>
                    </div>
                    <hr className="separator" />

                    <p className="mx-14 text-xl font-bold">How many milestone do you want to include?</p>
                    <div className="milestone-list mx-14">
                        {milestones.map(({ name, amount }, index) => {
                            const percent = Number((
                                (100 * (amount ?? 0)) /
                                totalCostWithoutFee
                            ).toFixed(0));
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
                                                            name: e.target.value,
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
                                                            amount: Number(e.target.value),
                                                        },
                                                        ...milestones.slice(
                                                            index + 1
                                                        ),
                                                    ])
                                                }
                                            />
                                            {totalCostWithoutFee !== 0 && (
                                                <div className="progress-container">
                                                    <div className="progress-value">
                                                        {percent}%
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                width: `${percent}%`,
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
                    <p
                        className="clickable-text btn-add-milestone mx-14 mb-0 text-xl font-bold"
                        onClick={onAddMilestone}
                    >
                        <FiPlusCircle color="var(--theme-primary)" />
                        Add milestone
                    </p>
                    <hr className="separator" />

                    <div className="budget-info mx-14">
                        <div className="budget-description">
                            <h3>Total price of the project</h3>
                            <div className="text-inactive">
                                This includes all milestonees, and is the amount
                                client will see
                            </div>
                        </div>
                        <div className="budget-value">
                            ${Number((totalCostWithoutFee).toFixed(2)).toLocaleString()}
                        </div>
                    </div>
                    <hr className="separator" />

                    <div className="budget-info mx-14">
                        <div className="budget-description">
                            <h3>
                                Imbue Service Fee 5% - Learn more about Imbue’s
                                fees
                            </h3>
                        </div>
                        <div className="budget-value">
                            ${Number((imbueFee).toFixed(2)).toLocaleString()}
                        </div>
                    </div>
                    <hr className="separator" />

                    <div className="budget-info mx-14">
                        <div className="budget-description">
                            <h3>Total</h3>
                        </div>
                        <div className="budget-value">
                            ${Number((totalCost).toFixed(2)).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <h3 className="section-title">Payment terms</h3>
                <div className="container payment-details px-14">
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
                        <h3>Currency</h3>

                        <div className="network-amount">
                            <select
                                name="currencyId"
                                onChange={handleChange}
                                placeholder="Select a currency"
                                required
                            >
                                {currencies.map((currency) => (
                                    <option
                                        value={Currency[currency]}
                                        key={Currency[currency]}
                                        className="duration-option"
                                    >
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                {/* TODO: Add Drafts Functionality */}
                {/* <button className="secondary-btn">Save draft</button> */}
            </div>
            {showPolkadotAccounts && renderPolkadotJSModal}
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 2]);
    const user = await getCurrentUser();
    const freelancer = await getFreelancerProfile(user.username);

    if (!freelancer) {
        redirect(`freelancers/new`);
    }

    if (briefId) {
        const userApplication = await getUserBrief(user.id, briefId);
        if (userApplication) {
            redirect(`briefs/${briefId}/applications/${userApplication.id}/`)
        }
        const brief: Brief = await getBrief(briefId);
        ReactDOMClient.createRoot(
            document.getElementById("submit-proposal")!
        ).render(<SubmitProposal brief={brief} user={user} />);
    }
});

