import { timeStamp } from "console";
import React from "react";
import ReactDOMClient from "react-dom/client";
import { Option } from "./components/option";
import { ProgressBar } from "./components/progressBar";
import { TagsInput } from "./components/tagsInput";
import { TextInput } from "./components/textInput";
import {
    stepData,
    scopeData,
    timeData,
    nameExamples,
    suggestedIndustries,
    suggestedSkills,
} from "./config/freelancer-data";
import * as config from "./config";
import { Freelancer, User } from "./models";
import { web3Accounts } from "@polkadot/extension-dapp";

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

export class Freelancers extends React.Component<FreelancerProps, FreelancerState> {
    state = {
        info: {
            id: "",
            education: "",
            experience: "",
            freelanced_before: false,
            work_type: "",
            skills: "",
            title: "",
            languages: "",
            services_offer: "",
            bio: "",
            user_id: "",
        },
        step: 0
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
        this.setState({
            ...this.state,
            info: {
                ...this.state.info,
                [name]: value,
            },
        });
    };

    render() {
        const { step } = this.state;
        const NamePanel = (
            <>
                <h1 className="field-name">Hello {this.props.username}, ready to find an oppertunity? </h1>
                <div className="name-panel-input-wrapper">
                </div>
                <p className="field-name">Examples</p>
            </>
        );

        const ConfirmPanel = (

            <div className="description-panel">
                <p className="field-name">Thank you for your submission!</p>
            </div>


        );

        const panels = [
            NamePanel,
            ConfirmPanel,
        ];

        return (
            <div className="freelancer-details-container">
                <div className="main-panel">
                    {/*<h1 className="heading">{stepData[0].heading}</h1>*/}
                    <div className="contents">{panels[step] ?? <></>}</div>
                    <div className="buttons">
                        {step >= 1 && (
                            <button
                                disabled={step < 1}
                                className="secondary-btn"
                                onClick={this.onBack}
                            >
                                Back
                            </button>
                        )}

                        {step === stepData.length - 1 ? (
                            <button
                                className="primary-btn in-dark w-button"
                                onClick={() => this.onDiscoverFreelancers(this.state.info)}
                            >
                                Discover Freelancers
                            </button>
                        ) :  step === stepData.length - 2 ? (
                            <button
                                className="primary-btn in-dark w-button"
                                onClick={() => this.onReviewPost(this.state.info)}
                            >
                                Submit
                            </button>
                        ) : (
                            <button
                                className="primary-btn in-dark w-button"
                                onClick={this.onNext}
                            >
                                {stepData[step].next ? `Next: ${stepData[step].next}` : "Next"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById("freelancer-details")!).render(
        <Freelancers username={"STATIC ANN"}
     /> )}
);
