import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";

import "../proposals/draft";
import ProposalsDraft from "../proposals/draft";

import "../proposals/preview";
import ProposalsDraftPreview from "../proposals/preview";

import "../proposals/listing";
import List from "../proposals/listing";

import "../proposals/detail";
import Detail from "../proposals/detail";

import * as utils from "../utils";
import { ImbueRequest } from "../dapp";
import * as config from "../config";
import { getPage } from "../utils";

const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;

const CONTENT = Symbol();

export default class Proposals extends HTMLElement {
  [CONTENT]: DocumentFragment;
  $pages: Pages;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this[CONTENT] = template.content.cloneNode(true) as DocumentFragment;

    this.$pages = this[CONTENT].getElementById("pages") as Pages;
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(this[CONTENT]);
  }

  async route(path: string | null, request: ImbueRequest) {
    if (!path) {
      location.assign("/dapp/proposals");
      return;
    }

    const route = new Route("/:page", path);
    const userProject = await request.userProject;

    switch (route.data?.page) {
      case "draft":
        if (
          userProject?.chain_project_id ||
          userProject?.chain_project_id === 0
        ) {
          utils.redirect(
            `${config.grantProposalsURL}/detail/${userProject.id}`
          );
          return;
        }

        await getPage<ProposalsDraft>(this.$pages, "editor").init(request);
        this.$pages.select("editor");
        break;
      case "preview":
        if (
          userProject?.chain_project_id ||
          userProject?.chain_project_id === 0
        ) {
          utils.redirect(
            `${config.grantProposalsURL}/detail/${userProject.id}`
          );
          return;
        }

        await getPage<ProposalsDraftPreview>(this.$pages, "preview").init(
          request
        );
        this.$pages.select("preview");
        break;
      case "detail":
        this.$pages.select("detail");
        (this.$pages.selected as Detail).init(request);
        break;
      default:
        this.dispatchEvent(utils.badRouteEvent("not-found"));
    }
  }
}

window.customElements.define("imbu-proposals", Proposals);
