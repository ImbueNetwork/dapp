import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import { MDCDialog } from '@material/dialog';
// import { MDCList } from '@material/list';

import { googleAuthEndpoint } from "../config";
import template from "./auth-dialog.html";
import styles from "./auth-dialog.css";
import googleButtonSVG from "../../assets/google_signin_buttons/web/vector/btn_google_light_pressed_ios.svg";


export default class AuthDialog extends Hoquet(HTMLElement, {
    shadowy: true,
    stylesheets: [stylesheet`${styles}`],
    template: html`${template}`
}) {

    dialog: MDCDialog;

    constructor() {
        super();

        this.render();
        this.$["google-btn"].appendChild(this.fragment(`${googleButtonSVG}`));

        this.dialog = new MDCDialog(this.$["dialog"]);

        this.$["dialog"].addEventListener("MDCDialog:closing", e => {
            const detail = (e as CustomEvent).detail;
            if (detail.action === "google") {
                window.location.href = `${googleAuthEndpoint}?n=/grant-submission`;
            }
        });
    }

    open() {
        this.dialog?.open();
    }
}

window.customElements.define("imbu-auth-dialog", AuthDialog);
