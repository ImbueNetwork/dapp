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
} from "./config/briefs-data";
import * as config from "./config";

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
  name: string;
  industries: string[];
  description: string;
  scope: string;
  time: string;
  skills: string[];
  budget: number | undefined;
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

export class Briefs extends React.Component<BriefProps, BriefState> {
  state = {
    step: 7,
    info: {
      name: "",
      industries: [],
      description: "",
      scope: "",
      time: "",
      skills: [],
      budget: undefined,
    },
  };
  constructor(props: BriefProps) {
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

  onReviewPost = (brief: BriefInfo) => {
    const { step } = this.state;
    step < stepData.length - 1 &&
      this.setState({ ...this.state, step: step + 1 });
    invokeBriefAPI(brief);
  };


  onReviewPost = (brief: BriefInfo) => {
    // redirect to discover briefs page
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

    const IndustriesPanel = (
      <>
        <p className="field-name">Search industries or add your own</p>
        <div className="industry-container">
          <TagsInput
            suggestData={suggestedIndustries}
            tags={this.state.info.industries}
            onChange={(tags: string[]) =>
              this.updateFormData("industries", tags)
            }
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

    const SkillsPanel = (
      <>
        <p className="field-name">Search the skills</p>
        <div className="skills-container">
          <TagsInput
            suggestData={suggestedSkills}
            tags={this.state.info.skills}
            onChange={(tags: string[]) => this.updateFormData("skills", tags)}
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
            value={this.state.info.budget || ""}
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
      ScopePanel,
      TimePanel,
      BudgetPanel,
      ConfirmPanel,
    ];

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
                onClick={() => this.discoverBriefs(this.state.info)}
              >
                Discover Briefs
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
  ReactDOMClient.createRoot(document.getElementById("brief-details")!).render(
    <Briefs />
  );
});
