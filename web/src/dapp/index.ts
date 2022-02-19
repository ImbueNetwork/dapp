import "@pojagi/hoquet/lib/pages/pages";
import "@pojagi/hoquet/lib/layout/layout";
import "@pojagi/hoquet/lib/nav/nav";
import Nav, { MenuItem } from "@pojagi/hoquet/lib/nav/nav";
import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";
import Layout from "@pojagi/hoquet/lib/layout/layout";

import "../proposals";
import Proposals from "../proposals";

import materialIcons from "../../material-icons-link.html";
import commonCSS from "../styles/common.css";
import logo from "../../assets/logo.svg";

import html from "./index.html";
import styles from "./index.css";



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
        href: "/dapp/settings",
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

        (this[CONTENT].getElementById("logo") as HTMLElement).innerHTML = logo;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        
        this.$mainMenuButton.addEventListener("click", e => {
            this.$layout.openDrawer("right");
        });
        
        this.initNavigation(navigationItems);

        this.addEventListener("proposals:bad-route", e => {
            this.$pages.select((e as CustomEvent).detail);
        });

        window.addEventListener("popstate", e => {
            this.route(window.location.pathname);
            this.$layout.closeDrawer("right");
        });

        this.route(window.location.pathname);
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

    async route(path?: string) {
        if (!path) {
            return this.$pages.select("not-found");
        }

        const route = new Route("/dapp/:app", path);

        if (!route.active) {
            this.$pages.select("not-found");
            return;
        }

        switch (route.data?.app) {
            case "proposals":
                this.$pages.select("proposals");
                (this.$pages.selected as Proposals).route(route.tail);
                break;
            case "settings":
                this.$pages.select("not-implemented");
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

