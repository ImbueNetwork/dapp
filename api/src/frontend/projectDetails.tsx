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
  industryData,
  skillData,
} from "./config/details-data";

export type ProjectDetailsProps = {};

export type ProjectDetailsState = {
  step: number;
  info: ProjectInfo;
};

export type ProjectInfo = {
  name: string;
  industry: string[];
  description: string;
  scope: string;
  time: string;
  skill: string[];
  budget: number | undefined;
};

export class ProjectDetails extends React.Component<
  ProjectDetailsProps,
  ProjectDetailsState
> {
  state = {
    step: 0,
    info: {
      name: "",
      industry: [],
      description: "",
      scope: "",
      time: "",
      skill: [],
      budget: undefined,
    },
  };
  constructor(props: ProjectDetailsProps) {
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
        <p className="field-name">Write a headline for your brief</p>
        <div className="name-panel-input-wrapper">
          <input
            className="field-input"
            placeholder="Enter the name of your project"
            name="name"
            value={this.state.info.name}
            onChange={(e) => this.updateFormData("name", e.target.value)}
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

    const IndustryPanel = (
      <>
        <p className="field-name">Search industries or add your own</p>
        <div className="industry-container">
          <TagsInput
            suggestData={industryData}
            tags={this.state.info.industry}
            onChange={(tags: string[]) => this.updateFormData("industry", tags)}
          />
        </div>
      </>
    );

    const DescriptionPanel = (
      <div className="description-panel">
        <p className="field-name">Describe your project in a few sentences</p>
        <div className="description-container">
          <TextInput
            value={this.state.info.description}
            name="description"
            maxLength={5000}
            onChange={(e) => this.updateFormData("description", e.target.value)}
          />
        </div>
      </div>
    );

    const SkillPanel = (
      <>
        <p className="field-name">Search the skills</p>
        <div className="skills-container">
          <TagsInput
            suggestData={skillData}
            tags={this.state.info.skill}
            onChange={(tags: string[]) => this.updateFormData("skill", tags)}
          />
        </div>
      </>
    );

    const ScopePanel = (
      <div className="scope-container">
        {scopeData.map(({ label, value, description }, index) => (
          <Option
            label={label}
            value={value}
            key={index}
            checked={this.state.info.scope === value}
            onSelect={() => this.updateFormData("scope", value)}
          >
            {description ? (
              <div className="scope-item-description">{description}</div>
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
            checked={this.state.info.time === value}
            onSelect={() => this.updateFormData("time", value)}
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
            value={this.state.info.budget}
            onChange={(e) => this.updateFormData("budget", e.target.value)}
          />
          <div className="budget-currency-container">$</div>
        </div>
        <div className="budget-description">
          You will be able to set milestones which divide your project into
          manageable phases.
        </div>
      </div>
    );

    const panels = [
      NamePanel,
      IndustryPanel,
      DescriptionPanel,
      SkillPanel,
      ScopePanel,
      TimePanel,
      BudgetPanel,
    ];

    return (
      <div className="project-details-container">
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
                disabled={step < 1}
                className="secondary-btn"
                onClick={this.onBack}
              >
                Back
              </button>
            )}
            <button
              className="primary-btn in-dark w-button"
              onClick={this.onNext}
            >
              {step === stepData.length - 1
                ? "Review your post"
                : stepData[step].next
                ? `Next: ${stepData[step].next}`
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  ReactDOMClient.createRoot(document.getElementById("project-details")!).render(
    <ProjectDetails />
  );
});
