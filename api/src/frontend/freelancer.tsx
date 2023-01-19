import { timeStamp } from "console";
import React from "react";
import ReactDOMClient from "react-dom/client";
import {
    stepData,
    freelancedBefore,
    freelancingGoal,
    importInformation,
    suggestedFreelancingSkills, suggestedServices, suggestedLanguages,
} from "./config/freelancer-data";
import * as config from "./config";
import { Freelancer, User } from "./models";
import { Option } from "./components/option";
import { web3Accounts } from "@polkadot/extension-dapp";
import { ListItemFreelancer } from "./components/listItemFreelancer";
import { TagsInput } from "./components/tagsInput";
import { suggestedSkills } from "./config/briefs-data";
import { TextInput } from "./components/textInput";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export type FreelancerProps = {
    username: string;
};

export type FreelancerState = {
    step: number;
    info: Freelancer;
};

async function invokeFreelancerAPI(Freelancer: Freelancer) {
    const resp = await fetch(`${config.apiBase}/Freelancers/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({ Freelancer }),
    });

    if (resp.ok) {
        // could be 200 or 201
        // Freelancer API successfully invoked
        console.log("Freelancer created successfully via Freelancer REST API");
    }
}

export class Freelancers extends React.Component<
    FreelancerProps,
    FreelancerState
> {
    state = {
        info: {
            id: "",
            education: "",
            experience: "",
            freelanced_before: "",
            freelancing_goal: "",
            resume: "",
            work_type: "",
            skills: [],
            title: "",
            languages: [],
            services_offer: [],
            bio: "",
            user_id: "",
        },
        step: 6,
    };
    constructor(props: FreelancerProps) {
        super(props);
    }

    onBack = () => {
        const { step } = this.state;
        step >= 1 && this.setState({ ...this.state, step: step - 1 });
    };

    onNext = () => {
        const { step } = this.state;
        step < stepData.length - 1 &&
            this.setState({ ...this.state, step: step + 1 });
    };

    onReviewPost = (Freelancer: Freelancer) => {
        const { step } = this.state;
        step < stepData.length - 1 &&
            this.setState({ ...this.state, step: step + 1 });
        invokeFreelancerAPI(Freelancer);
    };

    onDiscoverFreelancers = (Freelancer: Freelancer) => {
        // redirect to discover Freelancers page
    };

    updateFormData = (name: string, value: string | number | string[]) => {
        console.log("This is", value);
        this.setState({
            ...this.state,
            info: {
                ...this.state.info,
                [name]: value,
            },
        });
    };

    handleChange(event: { target: { value: any; }; }) {
        this.setState({
            ...this.state,
            info: {
                ...this.state.info,
                ['bio']: event.target.value,
            },
        });
    }

    render() {
        const { step } = this.state;

        const HelloPanel = (
            <div className="hello-panel">
                <div className="content-text-small">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
        );

        const FreelanceExperience = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="freelance-xp-options">
                    {freelancedBefore.map(({ label, value }, index) => (
                        <div
                            key={index}
                            className={`freelance-xp-item ${
                                this.state.info.freelanced_before === value
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                this.updateFormData("freelanced_before", value)
                            }
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        );


        const FreelancingGoal = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="freelance-xp-options">
                    {freelancingGoal.map(({ label, value }, index) => (
                        <div
                            key={index}
                            className={`freelance-xp-item ${
                                this.state.info.freelancing_goal === value
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                this.updateFormData("freelancing_goal", value)
                            }
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        );


        const ImportResume = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="freelance-xp-options">
                    {importInformation.map(({ label, value }, index) => (
                        <div
                            key={index}
                            className={`freelance-xp-item ${
                                this.state.info.resume === value
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                this.updateFormData("resume", value)
                            }
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        );

        const TitlePanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="name-panel-input-wrapper">
                    <input
                        className="field-input"
                        placeholder="Enter your title"
                        name="title"
                        value={this.state.info.title}
                        onChange={(e) => this.updateFormData("title", e.target.value)}
                    />
                </div>
            </div>
        );

        const ExperiencePanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
        );

        const EducationPanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
        );

        const LanguagePanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="skills-container">
                    <TagsInput
                        suggestData={suggestedLanguages}
                        tags={this.state.info.languages}
                        onChange={(tags: string[]) => this.updateFormData("languages", tags)}
                    />
                </div>
            </div>
        );

        const SkillsPanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <p className="field-name">Your Skills</p><br/>
                <br/>
                <div className="skills-container">
                    <TagsInput
                        suggestData={suggestedFreelancingSkills}
                        tags={this.state.info.skills}
                        onChange={(tags: string[]) => this.updateFormData("skills", tags)}
                    />
                </div>
            </div>
        );

        const BioPanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                {/*<div className="name-panel-input-wrapper">*/}
                {/*    <textarea value={this.state.info.bio} onChange={this.handleChange} maxLength={1000} />*/}
                {/*    <TextInput*/}
                {/*        value={this.state.info.bio}*/}
                {/*        name="description"*/}
                {/*        maxLength={5000}*/}
                {/*        onChange={(e) => this.updateFormData("bio", e.target.value)}*/}
                {/*    />*/}
                {/*</div>*/}

                <div className="name-panel-input-wrapper">
                    <textarea
                        className="field-input large"
                        placeholder="Enter your bio"
                        name="title"
                        maxLength={5000}
                        value={this.state.info.bio}
                        onChange={(e) => this.updateFormData("bio", e.target.value)}
                    />
                </div>
            </div>
        );

        const ServicesPanel = (
            <div className="freelance-xp-container">
                <div className="content-text-small-flex">
                    {stepData[step].content.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className="skills-container">
                    <TagsInput
                        suggestData={suggestedServices}
                        tags={this.state.info.services_offer}
                        onChange={(tags: string[]) => this.updateFormData("services_offer", tags)}
                    />
                </div>
            </div>
        );


        const ConfirmPanel = (
            <div className="description-panel">
                <p className="content-text">Thank you for your submission!</p>
            </div>
        );

        // const panels = [HelloPanel, FreelanceExperience,FreelancingGoal,
        //     ImportResume,TitlePanel,ExperiencePanel,EducationPanel,LanguagePanel,SkillsPanel,BioPanel,ServicesPanel,
        //     ConfirmPanel];
        const panels = [
            HelloPanel, 
            FreelanceExperience
            ,FreelancingGoal,
            // ImportResume,
            TitlePanel,
            // ExperiencePanel,EducationPanel,
            LanguagePanel,
            SkillsPanel,
            BioPanel,
            ServicesPanel,
            ConfirmPanel];

        return (
            <div className="freelancer-details-container">
                <div className="main-panel">
                    <div className="contents">
                        <h2 className="name-title">{stepData[step].heading}</h2>
                        {panels[step] ?? <></>}
                    </div>
                    <div
                        className={step === 0 ? "button-left" : "button-right"}
                    >
                        {step >= 1 && (
                            <button
                                disabled={step < 1}
                                className="secondary-btn"
                                onClick={this.onBack}
                            >
                                Back
                            </button>
                        )}

                        {step === 0 ? (
                            <button
                                className="primary-btn in-dark w-button"
                                onClick={this.onNext}
                            >
                                Get Started!
                            </button>
                        ) : (
                            <button
                                className="primary-btn in-dark w-button"
                                onClick={this.onNext}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(
        document.getElementById("freelancer-details")!
    ).render(<Freelancers username={"STATIC ANN"} />);
});
