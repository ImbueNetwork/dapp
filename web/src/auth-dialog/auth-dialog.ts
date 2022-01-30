import { MDCDialog } from '@material/dialog';
import { googleAuthEndpoint } from "../config";
import templateSrc from "./auth-dialog.html";
import styles from "./auth-dialog.css";
import materialComponentsLink from "../../material-components-link.html";
import googleButtonSVGSrc from "../../assets/google_signin_buttons/web/vector/btn_google_dark_normal_ios.svg";

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

const googleButtonSVG = document.createElement("template");
googleButtonSVG.innerHTML = googleButtonSVGSrc;

const CONTENT = Symbol();


export default class AuthDialog extends HTMLElement {
    dialog: MDCDialog;
    next = window.location.href;
    private [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as
            DocumentFragment;

        const $dialog =
            this[CONTENT].getElementById("dialog") as HTMLElement;
        const $googleBtn = this[CONTENT].getElementById("google-btn");

        $googleBtn?.appendChild(googleButtonSVG.content.cloneNode(true));
        this.dialog = new MDCDialog($dialog);
        
        $dialog.addEventListener("MDCDialog:closing", e => {
            const detail = (e as CustomEvent).detail;
        
            if (detail.action === "google") {
                window.location.href = `${
                    googleAuthEndpoint
                }?n=${
                    this.next ?? window.location.href
                }`;
            }
        });
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    open(next?: string) {
        this.next = next ? next : this.next;
        this.dialog?.open();
    }
}

window.customElements.define("imbu-auth-dialog", AuthDialog);
