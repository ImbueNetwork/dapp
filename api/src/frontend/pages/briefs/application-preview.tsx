import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "../../components/milestoneItem";
import { timeData } from "../../config/briefs-data";
import * as config from "../../config";
import { Brief, Currency, Freelancer, Project, ProjectStatus, User } from "../../models";
import { changeBriefApplicationStatus as updateBriefApplicationStatus, getBrief } from "../../services/briefsService";
import { BriefInsights } from "../../components";
import { fetchProject, fetchUser, getCurrentUser, redirect } from "../../utils";
import { getFreelancerProfile } from "../../services/freelancerService";
import "../../styles/application-preview.css";
import { HirePopup } from "../../components/hire-popup";
import ChatPopup from "../../components/chat-popup";
import ChainService from "../../services/chainService";
import { getWeb3Accounts, initImbueAPIInfo } from "../../utils/polkadot";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { blake2AsHex } from '@polkadot/util-crypto';
import { Backdrop, CircularProgress } from "@mui/material";

interface MilestoneItem {
    name: string;
    amount: number | undefined;
}

export type ApplicationPreviewProps = {
    brief: Brief;
    user: User;
    application: Project;
    freelancer: Freelancer;
};

const applicationStatusId = ["Draft", "Pending Review", "Changes Requested", "Rejected", "Accepted"]

export const ApplicationPreview = ({ brief, user, application, freelancer }: ApplicationPreviewProps): JSX.Element => {
    const [currencyId, setCurrencyId] = useState(application.currency_id);
    const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
    const [openPopup, setOpenPopup] = useState<boolean>(false);
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false)
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [briefOwner, setBriefOwner] = useState<User>();
    const applicationStatus = ProjectStatus[application.status_id]
    const isApplicationOwner = user.id == application.user_id;
    const isBriefOwner = user.id == brief.user_id;
    const [freelancerAccount, setFreelancerAccount] = React.useState<InjectedAccountWithMeta>();
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        async function setup() {
            const briefOwner: User = await fetchUser(brief.user_id);
            setBriefOwner(briefOwner);
            await fetchAndSetAccounts();
        }
        setup();
    }, []);

    const fetchAndSetAccounts = async () => {
        const accounts = await getWeb3Accounts();
        const account = accounts.filter(account => account.address === freelancer.web3_address)[0];
        setFreelancerAccount(account);
    };

    const viewFullBrief = () => {
        redirect(`briefs/${brief.id}/`);
    };

    const updateProject = async (chainProjectId?: number) => {
        setLoading(true)
        await fetch(`${config.apiBase}/projects/${application.id}`, {
            headers: postAPIHeaders,
            method: "put",
            body: JSON.stringify({
                user_id: user.id,
                name: `${brief.headline}`,
                total_cost_without_fee: totalCostWithoutFee,
                imbue_fee: imbueFee,
                currency_id: currencyId,
                milestones: milestones.filter(m => m.amount !== undefined).map(m => { return { name: m.name, amount: m.amount, percentage_to_unlock: (((m.amount ?? 0) / totalCostWithoutFee) * 100).toFixed(0) } }),
                required_funds: totalCost,
                chain_project_id: chainProjectId
            }),
        });
        setLoading(false)
        setIsEditingBio(false)
    };

    const startWork = async () => {
        if (freelancerAccount) {
            setLoading(true)
            const imbueApi = await initImbueAPIInfo();
            const chainService = new ChainService(imbueApi, user);
            delete application.modified;
            const briefHash = blake2AsHex(JSON.stringify(application));
            const result = await chainService?.commenceWork(freelancerAccount, briefHash);
            while (true) {
                if (result.status || result.txError) {
                    if (result.status) {
                        console.log("***** success");
                        const projectId = parseInt(result.eventData[2]);
                        await updateProject(projectId);
                    } else if (result.txError) {
                        console.log("***** failed");
                        console.log(result.errorMessage);
                    }
                    break;
                }
                await new Promise(f => setTimeout(f, 1000));
            }
            setLoading(false)
        }

    }

    const imbueFeePercentage = 5;
    const applicationMilestones = application.milestones.filter(m => m.amount !== undefined).map(m => { return { name: m.name, amount: Number(m.amount) } });
    const [milestones, setMilestones] = useState<MilestoneItem[]>(applicationMilestones);

    const currencies = Object.keys(Currency).filter(key => !isNaN(Number(Currency[key])));

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

    const handleMessageBoxClick = async (user_id, freelancer) => {
        if (user_id) {
            setShowMessageBox(true);
            setTargetUser(await fetchUser(user_id));
        } else {
            redirect("login", `/dapp/freelancers/${freelancer?.username}/`)
        }
    }

    const updateApplicationState = async (application, projectStatus: ProjectStatus) => {
        await updateBriefApplicationStatus(application.brief_id, application.id, projectStatus);
        window.location.reload();
    }

    return (
        <div className="application-container">
            {user && showMessageBox && <ChatPopup {...{ showMessageBox, setShowMessageBox, browsingUser: user, targetUser }} />}

            {isBriefOwner && (
                <>
                    <div className="flex items-center justify-evenly">
                        <img className="w-16 h-16 rounded-full object-cover" src='/public/profile-image.png' alt="" />
                        <div className="">
                            <p className="text-xl font-bold">{freelancer?.display_name}</p>
                            <p className="text-base mt-2 underline cursor-pointer primary-text" onClick={() => redirect(`freelancers/${freelancer?.username}/`)}>View Full Profile</p>
                        </div>
                        <div>
                            <p className="text-xl primary-text">@{freelancer?.username}</p>
                        </div>
                        <button className="Pending.Review-btn in-dark w-button rounded-full px-6 py-3 dark-button" onClick={() => handleMessageBoxClick(application.user_id, freelancer?.username)}>Message</button>

                        <div className="grid grid-cols-2 gap-2">
                            {
                                application.status_id == ProjectStatus.PendingReview ?
                                    <>
                                        <button onClick={() => { setOpenPopup(true) }} className="Accepted-btn in-dark w-button rounded-full px-1 py-2 dark-button">Hire</button>
                                        <button onClick={() => { updateApplicationState(application, ProjectStatus.ChangesRequested) }} className="Request-btn in-dark w-button rounded-full px-1 py-2 dark-button">Request Changes</button>
                                        <button onClick={() => { updateApplicationState(application, ProjectStatus.Rejected) }} className="Rejected-btn in-dark w-button rounded-full px-1 py-2 dark-button">Reject</button>
                                    </>
                                    :
                                    <button className={`${applicationStatusId[application?.status_id]}-btn in-dark w-button rounded-full px-6 py-3`}>{applicationStatusId[application?.status_id]}</button>

                            }
                        </div>
                    </div>
                    <HirePopup {...{ openPopup, setOpenPopup, brief, freelancer, application, milestones, totalCostWithoutFee, imbueFee, totalCost, setLoading }} />
                </>
            )}

            {isApplicationOwner && (
                <div className="flex items-center justify-evenly">
                    <img className="w-16 h-16 rounded-full object-cover" src='/public/profile-image.png' alt="" />
                    <div className="">
                        <p className="text-xl font-bold">{briefOwner?.display_name}</p>
                    </div>
                    <div>
                        <p className="text-xl primary-text">@{briefOwner?.username}</p>
                    </div>
                    <div>
                        <button className="primary-btn in-dark w-button" onClick={() => handleMessageBoxClick(brief.user_id, freelancer?.username)}>Message</button>
                        {
                            application.status_id === 4
                                ? <button onClick={() => brief.project_id && startWork()} className="Accepted-btn in-dark w-button rounded-full text-black px-6 py-3">Start Work</button>
                                : <button className={`${applicationStatusId[application?.status_id]}-btn in-dark w-button rounded-full px-6 py-3`}>{applicationStatusId[application?.status_id]}</button>
                        }

                    </div>
                </div>
            )}

            <HirePopup {...{ openPopup, setOpenPopup, brief, freelancer, application, milestones, totalCostWithoutFee, imbueFee, totalCost, setLoading }} />

            <Backdrop
                sx={{ color: '#fff', zIndex: 5 }}
                open={loading}
            // onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {
                <div className="section">
                    <h3 className="section-title">Job description</h3>
                    <BriefInsights brief={brief} />
                </div>
            }
            <div className="section">
                <div className="container milestones">
                    <div className="milestone-header mx-14 -mb-3">
                        <h3 className="flex">Milestones
                            {!isEditingBio && isApplicationOwner && (
                                <div className="edit-icon" onClick={() => setIsEditingBio(true)}><FiEdit /></div>
                            )}
                        </h3>
                        <h3>Client's budget: ${Number(brief.budget).toLocaleString()}</h3>
                    </div>
                    <hr className="separator" />
                    {isEditingBio && <p className="mx-14 text-xl font-bold">How many milestone do you want to include?</p>}
                    <div className="milestone-list mx-14 mb-5">
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
                                            {
                                                isEditingBio
                                                    ? <textarea
                                                        className="input-description"
                                                        value={name}
                                                        disabled={!isEditingBio}
                                                        onChange={(e) =>
                                                            setMilestones([...milestones.slice(0, index),
                                                            {
                                                                ...milestones[index],
                                                                name: e.target.value,
                                                            },
                                                            ...milestones.slice(
                                                                index + 1
                                                            ),

                                                            ])
                                                        }
                                                    />
                                                    : <p>{milestones[index]?.name}</p>
                                            }

                                        </div>
                                        <div className="budget-wrapper">
                                            <h3>Amount</h3>
                                            {
                                                isEditingBio
                                                    ? <input
                                                        type="number"
                                                        className="input-budget"
                                                        disabled={!isEditingBio}
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
                                                    : <p>{milestones[index]?.amount}</p>
                                            }

                                            {(totalCostWithoutFee !== 0 && isEditingBio) && (
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
                    {isEditingBio &&
                        <h4
                            className="clickable-text btn-add-milestone mx-14 text-2xl"
                            onClick={onAddMilestone}
                        >
                            <FiPlusCircle color="var(--theme-primary)" />
                            Add milestone
                        </h4>

                    }
                </div>
            </div>
            <div className="container">
                <p className="mx-14 mb-4 text-xl font-bold">Costs</p>
                <hr className="separator" />
                <div className="budget-info mx-14 mt-7">
                    <div className="budget-description">
                        <h3>Total price of the project</h3>
                        <div className="text-inactive">
                            This includes all milestones, and is the amount
                            client will see
                        </div>
                    </div>
                    <div className="budget-value">
                        ${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
                    </div>
                </div>
                <div className="budget-info mx-14">
                    <div className="budget-description">
                        <h3>
                            Imbue Service Fee 5%
                        </h3>
                    </div>
                    <div className="budget-value">
                        ${Number((imbueFee).toFixed(2)).toLocaleString()}
                    </div>
                </div>
                <div className="budget-info mx-14">
                    <div className="budget-description">
                        <h3>Total</h3>
                    </div>
                    <div className="budget-value">
                        ${Number((totalCost).toFixed(2)).toLocaleString()}
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
                                disabled={!isEditingBio}
                                defaultValue={Number(application.currency_id)}
                                required
                            >
                                {currencies.map((currency, index) => (
                                    <option
                                        value={index}
                                        key={index}
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
                    onClick={() => viewFullBrief()}
                >
                    Back To Brief
                </button>
                {isEditingBio &&
                    <button
                        className="primary-btn in-dark w-button"
                        onClick={() => updateProject()}
                    >
                        Update
                    </button>}

                {/* TODO: Add Drafts Functionality */}
                {/* <button className="secondary-btn">Save draft</button> */}
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let paths = window.location.pathname.split("/");
    let briefId = paths.length >= 2 && parseInt(paths[paths.length - 4]);
    let applicationId = paths.length >= 2 && parseInt(paths[paths.length - 2]);

    if (briefId && applicationId) {

        const application = await fetchProject(applicationId);
        const freelancerUser = await fetchUser(Number(application.user_id));
        const freelancer = await getFreelancerProfile(freelancerUser.username);

        const brief: Brief = await getBrief(briefId);
        const user = await getCurrentUser();

        ReactDOMClient.createRoot(
            document.getElementById("application-preview")!
        ).render(<ApplicationPreview brief={brief} user={user} application={application} freelancer={freelancer!} />);
    }
    // TODO 404 page when brief of application is not found
});
// fdsgit a