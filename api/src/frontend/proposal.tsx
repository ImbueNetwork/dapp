import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as config from "../legacy/config";
import { Project, User } from "../backend/models";
import * as model from "../backend/models";
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


type ProposalProps = {}
type ProposalState = {
    project: Project[]
}


const fetchProject = async (projectId: string) => {
    const resp = await fetch(
        `${config.apiBase}/projects/${projectId}`,
        {headers: config.getAPIHeaders}
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

    }


    // get projectId(): string | null {
    //     const candidate = window.location.pathname.split("/").pop();

    //     if (utils.validProjectId(candidate)) {
    //         return candidate as string;
    //     }

    //     return null;
    // }

    render() {
        return <div>
            <h1>{this.state.project.name}</h1>
            </div>
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
                     src={this.props.imageSrc}/>
                <div id="name">{this.props.name}</div>
            </a>
        </li>
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById('content-root')!)
        .render(<Proposal/>);
});