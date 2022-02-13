import "@pojagi/hoquet/lib/pages/pages";
import "@pojagi/hoquet/lib/layout/layout";
import "@pojagi/hoquet/lib/nav/nav";
import Nav, { MenuItem } from "@pojagi/hoquet/lib/nav/nav";
import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";
import Layout from "@pojagi/hoquet/lib/layout/layout";

import "../grant-submission/page/page";
import GrantSubmissionPage from "../grant-submission/page/page";
import "../grant-proposals/detail/page/page";
import GrantProposalsDetailPage from "../grant-proposals/detail/page/page";

import materialIcons from "../../material-icons-link.html";
import commonCSS from "../styles/common.css";
import logo from "../../assets/logo.svg";

import html from "./dapp.html";
import styles from "./dapp.css";


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
        name: "my-proposals",
        label: "List",
        href: "/dapp/proposals",
        icon: "library_books",
        spa: true,
    },
    {
        name: "search-proposals",
        label: "Search",
        href: "/dapp/proposals/search",
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
        window.addEventListener("popstate", e => {
            this.route();
        });
        this.route();
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

    routeProposalAction(path: string) {
        const route = new Route("/:action", path)

        // Available actions: "draft", "preview", "search"
        switch (route.data?.action) {
            case "draft":
                 this.$pages.select("draft");
                (this.$pages.selected as GrantSubmissionPage).init();
                break;
            case "preview":
                this.$pages.select("preview");
                (this.$pages.selected as GrantProposalsDetailPage).init();
                break;
            case "search":
                this.$pages.select("not-implemented");
                break;
            default:
                this.$pages.select("not-found");
        }
    }

    async routeProposalsListing() {
        // TODO:
        this.$pages.select("not-implemented");
    }

    async route() {
        const route = new Route("/dapp/:app");

        if (!route.active) {
            // FIXME: no app/page to route to
            // is this 404, etc?
            this.$pages.select("not-found");
            return;
        }

        switch (route.data?.app) {
            case "proposals":
                if (!route.tail) {
                    // i.e., /dapp/proposals
                    return await this.routeProposalsListing();
                }
                return await this.routeProposalAction(route.tail);
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

