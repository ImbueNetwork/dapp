import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import {
    stepData,
    freelancedBefore,
    freelancingGoal,
    importInformation,
    suggestedFreelancingSkills,
    suggestedServices,
    suggestedLanguages,
} from "../../config/freelancer-data";
import { Freelancer, User } from "../../models";
import { TagsInput } from "../../components/tagsInput";
import * as utils from "../../utils";
import { FreelancerService } from "../../services/freelancerService";
import "../../../../public/new-freelancer.css";

const freelancerService = new FreelancerService();

export type FreelancerProps = {
    username: string; // TODO: usecase?
};

export type FreelancerState = {
    step: number;
    info: Freelancer;
    display_name: string;
};

export const Freelancers = ({ username }: FreelancerProps): JSX.Element => {
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState("");
    const [freelancingXp, setFreelancingXp] = useState("");
    const [goal, setGoal] = useState("");
    const [resume, setResume] = useState("");
    const [title, setTitle] = useState("");
    const [languages, setLanguages] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [services, setServices] = useState<string[]>([]);

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
                            freelancingXp === value ? "active" : ""
                        }`}
                        onClick={() => setFreelancingXp(value)}
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
                            goal === value ? "active" : ""
                        }`}
                        onClick={() => setGoal(value)}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );

    const ImportResume = (
        // TODO:
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
                            resume === value ? "active" : ""
                        }`}
                        onClick={() => setResume(value)}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    tags={languages}
                    onChange={(tags: string[]) => setLanguages(tags)}
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
            <p className="field-name">Your Skills</p>
            <br />
            <br />
            <div className="skills-container">
                <TagsInput
                    suggestData={suggestedFreelancingSkills}
                    tags={skills}
                    onChange={(tags: string[]) => setSkills(tags)}
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

            <div className="name-panel-input-wrapper">
                <textarea
                    className="field-input large"
                    placeholder="Enter your bio"
                    name="title"
                    maxLength={5000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
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
                    tags={services}
                    onChange={(tags: string[]) => setServices(tags)}
                />
            </div>
        </div>
    );

    const ConfirmPanel = (
        <div className="description-panel">
            <p className="content-text">Thank you for your submission!</p>
        </div>
    );

    const panels = [
        HelloPanel,
        FreelanceExperience,
        FreelancingGoal,
        // ImportResume,
        TitlePanel,
        // ExperiencePanel,EducationPanel,
        LanguagePanel,
        SkillsPanel,
        BioPanel,
        ServicesPanel,
        ConfirmPanel,
    ];

    const createProfile = () => {
        setStep(step + 1);
        freelancerService.createFreelancingProfile({
            education: "",
            experience: "",
            freelanced_before: "",
            freelancing_goal: goal,
            work_type: "",
            skills,
            title,
            languages,
            services_offer: services,
            bio: "",
        });
    };

    return (
        <div className="freelancer-details-container">
            <div className="main-panel">
                <div className="contents">
                    <h2 className="name-title">
                        {stepData[step].heading.replace("{name}", displayName)}
                    </h2>
                    {panels[step] ?? <></>}
                </div>
                <div className={step === 0 ? "button-left" : "button-right"}>
                    {step >= 1 && (
                        <button
                            className="secondary-btn"
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>
                    )}

                    {step === 0 ? (
                        <button
                            className="primary-btn in-dark w-button"
                            onClick={() => setStep(1)}
                        >
                            Get Started!
                        </button>
                    ) : step === stepData.length - 1 ? ( // TODO:
                        <button
                            className="primary-btn in-dark w-button"
                            onClick={() => utils.redirect("briefs")}
                        >
                            Discover Briefs
                        </button>
                    ) : step === stepData.length - 2 ? (
                        <button
                            className="primary-btn in-dark w-button"
                            onClick={() => createProfile()}
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            className="primary-btn in-dark w-button"
                            onClick={() => setStep(step + 1)}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    //TODO: If the current user has a freelancer profile, forward to their profile

    ReactDOMClient.createRoot(
        document.getElementById("freelancer-details")!
    ).render(<Freelancers username={"STATIC ANN"} />);
});