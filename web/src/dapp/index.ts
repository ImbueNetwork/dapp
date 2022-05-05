import "@pojagi/hoquet/lib/pages/pages";
import Pages from "@pojagi/hoquet/lib/pages/pages";

import "@pojagi/hoquet/lib/layout/layout";
import Layout from "@pojagi/hoquet/lib/layout/layout";

import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog from "@pojagi/hoquet/lib/dialog/dialog";

import "@pojagi/hoquet/lib/nav/nav";
import Nav, {MenuItem} from "@pojagi/hoquet/lib/nav/nav";

import Route from "@pojagi/hoquet/lib/route/route";

import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types';

import * as utils from "../utils";
import * as config from "../config";

import "../proposals";
import Proposals from "../proposals";

import "../dashboard";
import Dashboard from "../dashboard";

import materialIcons from "../../material-icons-link.html";
import commonCSS from "../styles/common.css";
import logo from "../../assets/logo.svg";

import "../authentication"
import Authentication from "../authentication";

import "../account-choice";
import AccountChoice from "../account-choice";

import * as model from "../model";
import {Proposal, User} from "../model";
import {getWeb3Accounts} from "../utils/polkadot";

import html from "./index.html";
import styles from "./index.css";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {getPage} from "../utils";

import "../relay";
import Relay from "../relay";

export type ImbueRequest = {
    user: Promise<User | null>;
    userProject: Promise<Proposal | null>;
    accounts: Promise<InjectedAccountWithMeta[]>;
    apiInfo: Promise<ImbueApiInfo>;
};

export type ImbueApiInfo = {
    imbue: PolkadotJsApiInfo;
    relayChain: PolkadotJsApiInfo;
}

export type PolkadotJsApiInfo = {
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

const navigationItems = (isLoggedIn: boolean, hasProposal: boolean): MenuItem[] => {
    const menuItems: MenuItem[] = [];

    if (isLoggedIn) {
        menuItems.push({
            name: "account-dashboard",
            label: "Dashboard",
            href: "/dapp/dashboard",
            icon: "face",
            spa: true,
        });

        if (!hasProposal) {
            menuItems.push({
                name: "new-proposal",
                label: "Create a Proposal",
                href: "/dapp/proposals/draft",
                icon: "library_add",
                spa: true,
            });
        }
    } else {
        menuItems.push({
            name: "account-dashboard",
            label: "Log in",
            href: "/dapp/dashboard",
            icon: "face",
            spa: true,
        });
    }

    menuItems.push({
        name: "discover-proposals",
        label: "Discover",
        href: "/dapp/proposals",
        icon: "search",
        spa: true,
    });

    menuItems.push({
        name: "transfer-funds",
        label: "Transfer funds",
        href: "/dapp/relay",
        icon: "money",
        spa: true,
    });

    return menuItems;
}


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
    userProject: Promise<Proposal>;
    accounts: Promise<InjectedAccountWithMeta[]>;
    apiInfo: Promise<ImbueApiInfo>;


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

        this.userProject = this.user
            .then(user => model.fetchUserProject(user?.id))
            .then(resp => {
                if (resp.ok) {
                    return resp.json();
                }

                return null;
            });

        this.accounts = getWeb3Accounts();
        this.apiInfo = this.initImbueAPIInfo();

        (this[CONTENT].getElementById("logo") as HTMLElement).innerHTML = logo;
    }

    async connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);

        await this.bind();

        await this.route(window.location.pathname);
    }

    async bind() {
        this.addEventListener(config.event.badRoute, e => {
            this.$pages.select((e as CustomEvent).detail);
        });

        this.addEventListener(config.event.notification, e => {
            const {title, content, actions, isDismissable} =
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

        const user = await this.user;
        const userProject = await this.userProject;

        const isLoggedIn = !!user;
        const hasProposal = !!userProject;

        this.initNavigation(navigationItems(isLoggedIn, hasProposal));
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

    async initImbueAPIInfo(): Promise<ImbueApiInfo> {
        const {imbueNetworkWebsockAddr, relayChainWebsockAddr} = (await fetch(`${config.apiBase}/info`).then(
            resp => resp.json()
        ));

        return {
            imbue: await this.initPolkadotJSAPI(imbueNetworkWebsockAddr),
            relayChain: await this.initPolkadotJSAPI(relayChainWebsockAddr)
        }
    }

    async initPolkadotJSAPI(webSockAddr: string): Promise<PolkadotJsApiInfo> {
        const provider = new WsProvider(webSockAddr);
        provider.on("error", e => {
            this.errorNotification(e);
            console.log(e);
        });

        provider.on("disconnected", e => {
            console.log(e);
        });

        provider.on("connected", e => {
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
            const cause = e as Error;

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
            userProject: this.userProject,
            accounts: this.accounts,
            apiInfo: this.apiInfo,
        }

        if (!route.active) {
            /**
             * the path == `/dapp`, so we redirect to the default "app", which
             * is currently "/dapp/dashboard"
             */
            utils.redirect(
                this.getAttribute("default-route") || "/dashboard/"
            );
            return;
        }

        this.$pages.select("loading");

        switch (route.data?.app) {
            case "proposals":
                await getPage<Proposals>(this.$pages, "proposals").route(route.tail, request);
                this.$pages.select("proposals");
                break;
            case "dashboard":
                await getPage<Dashboard>(this.$pages, "dashboard").route(route.tail, request);
                this.$pages.select("dashboard");
                break;
            case "relay":
                await getPage<Relay>(this.$pages, "relay").init(request);
                this.$pages.select("relay");
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

