import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Option } from "../../components/option";
import { ProgressBar } from "../../components/progressBar";
import { TagsInput } from "../../components/tagsInput";
import { TextInput } from "../../components/textInput";
import * as utils from "../../utils";
import {
    stepData,
    scopeData,
    timeData,
    experiencedLevel,
    nameExamples,
    suggestedIndustries,
    suggestedSkills,
} from "../../config/briefs-data";
import * as config from "../../config";
import "../../../../public/new-brief.css";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export type BriefProps = {};

export type BriefState = {
    step: number;
    info: BriefInfo;
};

export type BriefInfo = {
    headline: string;
    industries: string[];
    description: string;
    scope_id: number | undefined;
    experience_id: number | undefined;
    duration_id: number | undefined;
    skills: string[];
    budget: bigint | undefined;
    user_id: number | undefined;
};

async function invokeBriefAPI(brief: BriefInfo) {
    const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({ brief }),
    });

    if (resp.ok) {
        // could be 200 or 201
        // Brief API successfully invoked
        console.log("Brief created successfully via Brief REST API");
    }
}

export const NewBrief = (props: BriefProps): JSX.Element => {
    const [step, setStep] = useState(0);
    const [headline, setHeadline] = useState("");
    const [industries, setIndustries] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [expId, setExpId] = useState<number>();
    const [scopeId, setScopeId] = useState<number>();
    const [durationId, setDurationId] = useState<number>();
    const [budget, setBudget] = useState<number>();

    const NamePanel = (
        <>
            <p className="field-name">Write a headline for your brief</p>
            <div className="name-panel-input-wrapper">
                <input
                    className="field-input"
                    data-testid="headline-input"
                    placeholder="Enter the name of your project"
                    name="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                />
            </div>
            <p className="field-name">Examples</p>
            <div className="name-panel-name-examples">
                {nameExamples.map((name, index) => (
                    <p className="name-panel-name-example" key={index}>
                        {name}
                    </p>
                ))}
            </div>
        </>
    );

    const IndustriesPanel = (
        <>
            <p className="field-name">Search industries or add your own</p>
            <div className="industry-container">
                <TagsInput
                    suggestData={suggestedIndustries}
                    data-testid="industries-input"
                    tags={industries}
                    onChange={(tags: string[]) => setIndustries(tags)}
                />
            </div>
        </>
    );

    const DescriptionPanel = (
        <div className="description-panel">
            <p className="field-name">
                Describe your project in a few sentences
            </p>
            <div className="description-container">
                <TextInput
                    value={description}
                    name="description"
                    maxLength={5000}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
        </div>
    );

    const SkillsPanel = (
        <>
            <p className="field-name">Search the skills</p>
            <div className="skills-container">
                <TagsInput
                    suggestData={suggestedSkills}
                    tags={skills}
                    onChange={(tags: string[]) => setSkills(tags)}
                />
            </div>
        </>
    );

    const ExperienceLevelPanel = (
        <div className="experience-level-container">
            {experiencedLevel.map(({ label, value }, index) => (
                <Option
                    label={label}
                    value={value}
                    key={index}
                    checked={expId === value}
                    onSelect={() => setExpId(value)}
                />
            ))}
        </div>
    );

    const ScopePanel = (
        <div className="scope-container">
            {scopeData.map(({ label, value, description }, index) => (
                <Option
                    label={label}
                    value={value}
                    key={index}
                    checked={scopeId === value}
                    onSelect={() => setScopeId(value)}
                >
                    {description ? (
                        <div className="scope-item-description">
                            {description}
                        </div>
                    ) : (
                        <></>
                    )}
                </Option>
            ))}
        </div>
    );

    const TimePanel = (
        <div className="time-container">
            {timeData.map(({ label, value }, index) => (
                <Option
                    label={label}
                    value={value}
                    key={index}
                    checked={durationId === value}
                    onSelect={() => setDurationId(value)}
                />
            ))}
        </div>
    );

    const BudgetPanel = (
        <div>
            <p className="field-name">Maximum project budget (USD)</p>
            <div className="budget-input-container">
                <input
                    className="field-input"
                    style={{ paddingLeft: "24px" }}
                    type="number"
                    value={budget || ""}
                    onChange={(e) => setBudget(Number(e.target.value))}
                />
                <div className="budget-currency-container">$</div>
            </div>
            <div className="budget-description">
                You will be able to set milestones which divide your project
                into manageable phases.
            </div>
        </div>
    );

    const ConfirmPanel = (
        <div className="description-panel">
            <p className="field-name">Thank you for your submission!</p>
        </div>
    );

    const panels = [
        NamePanel,
        IndustriesPanel,
        DescriptionPanel,
        SkillsPanel,
        ExperienceLevelPanel,
        ScopePanel,
        TimePanel,
        BudgetPanel,
        ConfirmPanel,
    ];
    const validate = (): boolean => {
        // TODO: show notification
        if (step === 0 && !headline) {
            return false;
        }
        if (step === 1 && !industries.length) {
            return false;
        }
        if (step === 2 && !description) {
            // TODO: minimum required length for description
            return false;
        }
        if (step === 3 && !skills.length) {
            return false;
        }
        if (step === 4 && expId === undefined) {
            return false;
        }
        if (step === 5 && !scopeId) {
            return false;
        }
        if (step === 6 && durationId === undefined) {
            return false;
        }
        if (step === 7 && !budget) {
            return false;
        }
        return true;
    };

    const onReviewPost = async () => {
        const user_id = (await utils.getCurrentUser()).id;

        const resp = await fetch(`${config.apiBase}/briefs/`, {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify({
                headline,
                industries,
                description,
                scope_id: scopeId,
                experience_id: expId,
                duration_id: durationId,
                skills,
                budget,
                user_id,
            }),
        });

        if (resp.ok) {
            // could be 200 or 201
            // Brief API successfully invoked
            console.log("Brief created successfully via Brief REST API");
        } else {
            console.log("Failed to submit the brief");
        }
        setStep(step + 1);
    };

    return (
        <div className="brief-details-container">
            <div className="left-panel">
                <ProgressBar
                    titleArray={["Description", "Skills", "Scope", "Budget"]}
                    currentValue={stepData[step].progress}
                />
                <h1 className="heading">{stepData[step].heading}</h1>
                {stepData[step].content.split("\n").map((content, index) => (
                    <p className="help" key={index}>
                        {content}
                    </p>
                ))}
            </div>
            <div className="right-panel">
                <div className="contents">{panels[step] ?? <></>}</div>
                <div className="buttons">
                    {step >= 1 && (
                        <button
                            className="secondary-btn"
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>
                    )}

                    {step === stepData.length - 1 ? (
                        <button
                            className="primary-btn in-dark w-button"
                            onClick={() => utils.redirect("briefs")}
                        >
                            Discover Briefs
                        </button>
                    ) : step === stepData.length - 2 ? (
                        <button
                            className="primary-btn in-dark w-button"
                            disabled={!validate()}
                            onClick={() => onReviewPost()}
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            className="primary-btn in-dark w-button"
                            data-testid="next-button"
                            onClick={() => setStep(step + 1)}
                            disabled={!validate()}
                        >
                            {stepData[step].next
                                ? `Next: ${stepData[step].next}`
                                : "Next"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


document.addEventListener("DOMContentLoaded", async (event) => {
    ReactDOMClient.createRoot(document.getElementById("brief-details")!).render(
        <NewBrief />
    );
});
