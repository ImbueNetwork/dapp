import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";

import materialIconsLink from "../../../material-icons-link.html";
import templateSrc from "./index.html";
import styles from "./index.css";
import type { GrantProposal, Project, User } from "../../model";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

export default class Detail extends HTMLElement {
    private _projectId?: string;
    draft?: GrantProposal | Project;
    // project?: {};
    address?: string;
    user?: User;
    private [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as DocumentFragment
    }

    init() {}
}

window.customElements.define("imbu-proposals-detail", Detail);
