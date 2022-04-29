import "@pojagi/hoquet/lib/pages/pages";
import Pages from "@pojagi/hoquet/lib/pages/pages";

import "@pojagi/hoquet/lib/layout/layout";
import Layout from "@pojagi/hoquet/lib/layout/layout";

import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog from "@pojagi/hoquet/lib/dialog/dialog";

import "@pojagi/hoquet/lib/nav/nav";
import Nav, { MenuItem } from "@pojagi/hoquet/lib/nav/nav";

import Route from "@pojagi/hoquet/lib/route/route";

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import * as utils from "../utils";
import * as config from "../config";

import "../proposals";
import Proposals from "../proposals";

import "../my-projects";
import MyProjects from "../my-projects";

import materialIcons from "../../material-icons-link.html";
import commonCSS from "../styles/common.css";
import logo from "../../assets/logo.svg";

import "../authentication"
import Authentication from "../authentication";

import "../account-choice";
import AccountChoice from "../account-choice";

import { User } from "../model";
import { getWeb3Accounts } from "../utils/polkadot";

import html from "./index.html";
import styles from "./index.css";
import { ApiPromise, WsProvider } from "@polkadot/api";


export type ImbueRequest = {
    user: Promise<User | null>;
    accounts: Promise<InjectedAccountWithMeta[]>;
    apiInfo: Promise<polkadotJsApiInfo>;
};

export type polkadotJsApiInfo = {
    api: ApiPromise;
    provider: WsProvider;
    webSockAddr: string;
}


const template = document.createElement("template");
template.innerHTML = `
    ${materialIcons}
    <style>${styles}</style>
    ${html}
`;
const CONTENT = Symbol();

const navigationItems: MenuItem[] = [
    {
        name: "new-proposal",
        label: "New",
        href: "/dapp/proposals/draft",
        icon: "library_add",
        spa: true,
    },
    // FIXME: only if logged in:
    {
        name: "drafts",
        label: "Drafts",
        href: "/dapp/proposals/draft/list",
        icon: "library_books",
        spa: true,
    },
    {
        name: "discover-proposals",
        label: "Discover",
        href: "/dapp/proposals",
        icon: "search",
        spa: true,
    },
    // FIXME: only when logged in:
    {
        name: "account-settings",
        label: "Me",
        href: "/dapp/myprojects",
        icon: "face",
        spa: true,
    },
    {
        name: "contact",
        label: "Contact",
        href: "/#join",
        icon: "alternate_email"
    }
].filter(x => x);


window.customElements.define("imbu-dapp", class extends HTMLElement {
    [CONTENT]: DocumentFragment;
    $nav: Nav;
    $layout: Layout;
    $mainMenuButton: HTMLAnchorElement;
    $pages: Pages;
    $dialog: Dialog;
    $accountChoice: AccountChoice;
    $auth: Authentication;

    user: Promise<User>;
    accounts: Promise<InjectedAccountWithMeta[]>;
    apiInfo: Promise<polkadotJsApiInfo>;


    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this[CONTENT] = template.content.cloneNode(true) as
            DocumentFragment;

        this.$layout =
            this[CONTENT].getElementById("layout") as
                Layout;
        this.$nav =
            this[CONTENT].getElementById("nav") as
                Nav;
        this.$mainMenuButton =
            this[CONTENT].getElementById("main-menu") as
                HTMLAnchorElement;
        this.$pages =
            this[CONTENT].getElementById("pages") as
                Pages;
        this.$dialog =
            this[CONTENT].getElementById("dialog") as
                Dialog;
        this.$auth =
            this[CONTENT].getElementById("auth") as
                Authentication;
        this.$accountChoice =
            this[CONTENT].getElementById("account-choice") as
                AccountChoice;

        this.user = fetch(`${config.apiBase}/user`).then(
            resp => {
                if (resp.ok) {
                    return resp.json();
                }
                return null;
            }
        );

        this.accounts = getWeb3Accounts();
        this.apiInfo = this.initPolkadotJSAPI();

        (this[CONTENT].getElementById("logo") as HTMLElement).innerHTML = logo;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);

        this.bind();

        this.route(window.location.pathname);
    }

    bind() {
        this.addEventListener(config.event.badRoute, e => {
            this.$pages.select((e as CustomEvent).detail);
        });

        this.addEventListener(config.event.notification, e => {
            const { title, content, actions, isDismissable } =
                (e as CustomEvent).detail;

            this.$dialog.create(
                title, content, actions, isDismissable
            );
        });

        this.addEventListener(config.event.accountChoice, async e => {
            const callback = (e as CustomEvent).detail;
            callback(await this.$accountChoice.accountChoice());
        });

        this.$mainMenuButton.addEventListener("click", e => {
            this.$layout.openDrawer("right");
        });

        this.initNavigation(navigationItems);
        this.initAuthentication();
        this.initRouting();
    }

    initRouting() {
        window.addEventListener("popstate", e => {
            console.log("popstate", window.location.href);
            this.route(window.location.pathname);
            this.$layout.closeDrawer("right");
        });
    }

    initAuthentication() {
        this.addEventListener(config.event.authenticationRequired, e => {
            this.$auth.launchAuthDialog((e as CustomEvent).detail);
        });
    }

    navRelocate(
        screenTallEnoughForFooterNav: boolean,
        screenWideEnoughForDrawer: boolean,
    ) {
        if (screenWideEnoughForDrawer) {
            this.$nav.slot = "right-drawer";
            this.$nav.setAttribute("display-mode", "stack");
        } else if (screenTallEnoughForFooterNav) {
            this.$nav.slot = "footer";
            this.$nav.setAttribute("display-mode", "flex");
        } else {
            this.$nav.slot = "right-drawer";
            this.$nav.setAttribute("display-mode", "stack");
        }

        if (this.$nav.slot === "right-drawer") {
            this.$mainMenuButton.classList.remove("hidden");
        } else {
            this.$mainMenuButton.classList.add("hidden");
            this.$layout.closeDrawer("right");
        }
    }

    initNavigation(navigationItems: MenuItem[]) {
        navigationItems.forEach(item => this.$nav.addItem(item));
        this.$nav.init();

        this.$layout.breakpointer.addHandler(this.navRelocate.bind(this));
    }

    errorNotification(e: Error) {
        console.log(e);
        this.dispatchEvent(new CustomEvent(
            config.event.notification,
            {
                bubbles: true,
                composed: true,
                detail: {
                    title: e.name,
                    content: e.message,
                    actions: {},
                    isDismissable: true,
                }
            }
        ));
    }

    async initPolkadotJSAPI(): Promise<polkadotJsApiInfo> {
        const webSockAddr = (await fetch(`${config.apiBase}/info`).then(
            resp => resp.json()
        )).imbueNetworkWebsockAddr as string;

        const provider = new WsProvider(webSockAddr);
        provider.on("error", e => {
            this.errorNotification(e);
            console.log(e);
        });
        provider.on("disconnected", e => {
            // this.$dialog.create("PolkadotJS API Disconnected", "", {
            //     "dismiss": {label: "Okay"}
            // }, true);
            console.log(e);
        });
        /**
         * TODO: any reason to report this, specifically?
         */
        provider.on("connected", e => {
            // this.$dialog.create("PolkadotJS API Connected", "", {
            //     "dismiss": {label: "Okay"}
            // }, true);
            console.log("Polkadot JS connected", e);
        });

        try {
            const api = await ApiPromise.create({provider});

            return {
                api,
                provider,
                webSockAddr,
            }
        } catch (e) {
            let cause = e as Error;

            this.$dialog.create("PolkadotJS API Error", cause.message, {
                "dismiss": {label: "Okay"}
            }, true);

            throw new Error(
                "Unable to initialize PolkadotJS API",
                {cause: cause}
            );
        }
    }

    async route(path?: string) {
        if (!path) {
            return this.$pages.select("not-found");
        }

        const route = new Route(`${config.context}/:app`, path);
        const request: ImbueRequest = {
            user: this.user,
            accounts: this.accounts,
            apiInfo: this.apiInfo,
        }

        if (!route.active) {
            /**
             * the path == `/dapp`, so we redirect to the default "app", which
             * is currently "/dapp/proposals"
             */
            utils.redirect(
                this.getAttribute("default-route") || "/proposals/"
            );
            return;
        }

        switch (route.data?.app) {
            case "proposals":
                this.$pages.select("proposals");
                (this.$pages.selected as Proposals).route(route.tail, request);
                break;
            case "myprojects":
                this.$pages.select("my-projects");
                (this.$pages.selected as MyProjects).route(route.tail, request);
                break;
            default:
                this.$pages.select("not-found");
        }
    }
});

/**
 * This is required at the `document` level in order for the fonts to be loaded
 * such that `<link>`s within `shadowRoot` can render the font.
 *
 * We do this here because this should be considered the entrypoint of the app.
 */
document.head.appendChild(
    document.createRange().createContextualFragment(`
    <style>${commonCSS}</style>
    ${materialIcons}
    `)
);

