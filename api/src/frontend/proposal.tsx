import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { marked } from "marked";
import * as config from "../legacy/config";
import { Project, User } from "../backend/models";
import * as model from "../backend/models";
import { MDCTabBar } from "@material/tab-bar";
/**
 * Models the milestone data that appears in the /proposals/draft form
 */
export type DraftMilestone = {
    name: string;
    percentage_to_unlock: number;
}

export type Milestone = DraftMilestone & {
    milestone_index?: number;
    project_id: number;
    is_approved: boolean;
    created: string;
    modified: string;
};


export type DraftProposal = {
    name: string;
    logo: string;
    description: string;
    website: string;
    milestones: DraftMilestone[];
    required_funds: number;
    currency_id: number;
    owner: string;
    user_id?: number;
    chain_project_id?: number;
    category?: string | number;
};



export enum Currency {
    IMBU = 0,
    KSM = 1,
    KUSD = 2
}


type ProposalProps = {}
type ProposalState = {
    project: Project[]
}


const fetchProject = async (projectId: string) => {
    const resp = await fetch(
        `${config.apiBase}/projects/${projectId}`,
        { headers: config.getAPIHeaders }
    );

    if (resp.ok) {
        const project = await resp.json();
        return project;
    }
}

class Proposal extends React.Component {

    state = {
        project: {} as Project,
    }

    constructor(props: ProposalProps) {
        super(props);
        const projectId = "1";

        fetchProject(projectId).then((project) => {
            this.setState({
                project: project
            })
        });
        const test = Currency.IMBU;
        new MDCTabBar(document.getElementById("tab-bar"));

        
        document.addEventListener("MDCTabBar:activated", e => {
            const detail = (e as CustomEvent).detail;
            const container = document.getElementById('tab-content-container');
            Array.from(container.children).forEach(
                child => child.classList.remove("active")
            );
            container.children[detail.index].classList.add("active");
        });

    }

    render() {
        const project: DraftProposal = this.state.project;
        document.getElementById('project-name').innerText = project.name;
        document.getElementById('project-website').innerHTML = `<a href=${project.website} target="_blank">${project.website}</a>`;
        document.getElementById('project-logo').setAttribute("srcset", project.logo);
        document.getElementById('project-description').innerHTML = marked.parse(`${project.description}`);
        document.getElementById('funds-required').innerHTML = String(project.required_funds / 1e12);
        document.getElementById('project-detail-currency').innerHTML = "$" + Currency[project.currency_id as any];

        const milestones = document.getElementById('milestones');
        milestones.querySelectorAll('*').forEach(n => n.remove());
        project.milestones?.forEach(milestone => {
            milestones.appendChild(
                document.createRange().createContextualFragment(`
                    <li class="mdc-deprecated-list-item" tabindex="0">
                        <span class="mdc-deprecated-list-item__ripple"></span>
                        <span class="mdc-deprecated-list-item__graphic">
                            <i class="material-icons">pending_actions</i>
                        </span>
                        <span class="mdc-deprecated-list-item__text">
                            <span class="mdc-deprecated-list-item__primary-text">${milestone.name}</span>
                            <span class="mdc-deprecated-list-item__secondary-text">${milestone.percentage_to_unlock}%
                            </span>
                        </span>
                    </li>
                `)
            );
        });


    }
}
type ProposalItemProps = {
    projectId: number,
    imageSrc: string,
    name: string
}

type ProposalItemState = {}

class ProposalItem extends React.Component<ProposalItemProps, ProposalItemState> {
    state: ProposalItemState = {}

    render() {
        return <li>
            <a id="contribute" href={`/dapp/proposals/detail/${this.props.projectId}`}>
                <img id="img"
                    src={this.props.imageSrc} />
                <div id="name">{this.props.name}</div>
            </a>
        </li>
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById('project-body')!)
        .render(<Proposal />);
});