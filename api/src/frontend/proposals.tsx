import React from 'react';
import { useState, useEffect } from 'react';
import * as ReactDOMClient from "react-dom/client";
import * as config from "./config";

/**
 * Models the milestone data that appears in the /proposals/draft form
 */
export type DraftMilestone = {
  name: string;
  percentage_to_unlock: number;
};

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

/**
 * Models a "project" saved to the db, but not on chain.
 */
export type Proposal = DraftProposal & {
  id: number;
  status: string;
  user_id: number;
  create_block_number?: number;
  created: string;
  modified: string;
  milestones: Milestone[];
};

const fetchProjects = async () => {
  const resp = await fetch(`${config.apiBase}/projects/`, {
    headers: config.getAPIHeaders,
  });

  if (resp.ok) {
    return await resp.json();
  } else {
    // probably only 500+ here since this is a listing route
    // this.dispatchEvent(utils.badRouteEvent("server-error"));
  }
};

export const Proposals = (): JSX.Element => {
  const [projectsList, setProjectsList] = useState<Proposal[]>([]);

  useEffect(() => {
    fetchProjects().then((projects) => {
      // setProjectsList(projects);
    });
  }, []);

  return (
    <div>
      <ol id="list" className="proposals-list">
        {projectsList.map((p) => (
          <ProposalItem
            key={p.id}
            projectId={p.id}
            imageSrc={p.logo}
            name={p.name}
          ></ProposalItem>
        ))}
      </ol>
    </div>
  );
}

type ProposalItemProps = {
  projectId: number;
  imageSrc: string;
  name: string;
};

const ProposalItem = ({ projectId, imageSrc, name }: ProposalItemProps): JSX.Element => {
  return (
    <div className="imbu-proposal-item">
      <li>
        <a id="contribute" href={`/dapp/proposals/${projectId}`}>
          <img id="img" src={imageSrc} />
          <div id="name">{name}</div>
        </a>
      </li>
    </div>
  );
}

document.addEventListener("DOMContentLoaded", (event) => {
  ReactDOMClient.createRoot(document.getElementById("imbu-proposals")!).render(
    <Proposals />
  );
});
