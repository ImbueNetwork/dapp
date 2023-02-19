import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import "../../../../public/new-project.css";

type FormInput = {
    label: string;
    value: string;
    updateValue: (_value: string) => void;
    isMultiLine?: boolean;
};

type Section = {
    header: string;
    fields: Array<FormInput>;
};

export const NewProject = (): JSX.Element => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [linkedin, setLinkedin] = useState<string>("");
    const [wallet, setWallet] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [milestone1, setMilestone1] = useState<string>("");
    const [milestone2, setMilestone2] = useState<string>("");
    const [milestone3, setMilestone3] = useState<string>("");

    const links = [
        {
            label: "Projects | own",
            link: "",
        },
        {
            label: "Projects | contributed to",
            link: "",
        },
        {
            label: "My briefs",
            link: "",
        },
    ];

    const sections: Section[] = [
        {
            header: "First, some basic info",
            fields: [
                {
                    label: "Name",
                    value: name,
                    updateValue: setName,
                },
                {
                    label: "Email Address",
                    value: email,
                    updateValue: setEmail,
                },
                {
                    label: "Linkedin",
                    value: linkedin,
                    updateValue: setLinkedin,
                },
                {
                    label: "Wallet Address",
                    value: wallet,
                    updateValue: setWallet,
                },
            ],
        },
        {
            header: "Describe what you’ll be creating",
            fields: [
                {
                    label: "Select category",
                    value: category,
                    updateValue: setCategory,
                },
                {
                    label: "Tell us about your project",
                    value: description,
                    updateValue: setDescription,
                    isMultiLine: true,
                },
            ],
        },
        {
            header: "Milestones",
            fields: [
                {
                    label: "What's your first milestone?",
                    value: milestone1,
                    updateValue: setMilestone1,
                },
                {
                    label: "What's your second milestone?",
                    value: milestone2,
                    updateValue: setMilestone2,
                },
                {
                    label: "What's your third milestone?",
                    value: milestone3,
                    updateValue: setMilestone3,
                },
            ],
        },
    ];

    return (
        <div className="new-project-container">
            <div className="left-container">
                <h1 className="title">
                    Dashboard for initiators to edit/draft projects
                </h1>
                <div className="links-container">
                    {links.map(({ label, link }, index) => (
                        <a href={link} className="link" key={index}>
                            {label}
                        </a>
                    ))}
                </div>
            </div>
            <div className="form-container">
                {sections.map(({ header, fields }, index) => (
                    <div className="section-container" key={index}>
                        <h2 className="section-header">{header}</h2>
                        {fields.map(
                            (
                                { label, value, updateValue, isMultiLine },
                                index
                            ) => (
                                <React.Fragment key={index}>
                                    {!isMultiLine ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={label}
                                            value={value}
                                            onChange={(e) =>
                                                updateValue(e.target.value)
                                            }
                                        />
                                    ) : (
                                        <textarea
                                            placeholder={label}
                                            className="form-input multiline"
                                            value={value}
                                            onChange={(e) =>
                                                updateValue(e.target.value)
                                            }
                                        />
                                    )}
                                </React.Fragment>
                            )
                        )}
                    </div>
                ))}
                <div className="button-container submit-container">
                    <button className="primary-btn in-dark fullwidth submit">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    ReactDOMClient.createRoot(document.getElementById("new-project")!).render(
        <NewProject />
    );
});
