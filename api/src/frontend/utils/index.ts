import * as config from "../config";
import { StreamChat } from 'stream-chat';

export type BadRoute =
    | "not-found"
    | "not-implemented"
    | "server-error"
    | "bad-route";

export function redirect(path: string, returnUrl?: string) {
    if (returnUrl) {
        window.location.href = `${window.location.origin}/dapp/${path}?redirect=${returnUrl}`;
    }
    else {
        window.location.href = `${window.location.origin}/dapp/${path}`
    }
}

export async function redirectBack() {
    const redirect =
        new URLSearchParams(window.location.search).get("redirect") || "/dapp";
    const isRelative =
        new URL(document.baseURI).origin ===
        new URL(redirect, document.baseURI).origin;

    if (isRelative) {
        location.replace(redirect);
    } else {
        location.replace("/dapp");
    }
}

export const validProjectId = (candidate: any) => {
    return !!Number(String(candidate));
};

export const getCurrentUser = async () => {
    const resp = await fetch(`${config.apiBase}/user`);
    if (resp.ok) {
        return resp.json();
    }
    return null;
};

export const getProjectId = async () => {
    const candidate = window.location.pathname.split("/").pop();

    if (validProjectId(candidate)) {
        return candidate as string;
    }

    return null;
};

export const fetchProject = async (projectId: string | number | null) => {
    const resp = await fetch(`${config.apiBase}/projects/${projectId}`, {
        headers: config.getAPIHeaders,
    });
    if (resp.ok) {
        const project = await resp.json();
        return project;
    }
};

export const fetchUserOrEmail = async (userOrEmail: string) => {
    const resp = await fetch(`${config.apiBase}/users/${userOrEmail}`, {
        headers: config.getAPIHeaders,
    });
    if (resp.ok) {
        const user = await resp.json();
        return user;
    }
};

export const fetchUser = async (id: number) => {
    const resp = await fetch(`${config.apiBase}/users/byid/${id}`, {
        headers: config.getAPIHeaders,
    });
    if (resp.ok) {
        const user = await resp.json();
        return user;
    }
};

export const badRouteEvent = (type: BadRoute) =>
    new CustomEvent(config.event.badRoute, {
        bubbles: true,
        composed: true,
        detail: type,
    });

export function validateForm(form: HTMLFormElement): boolean {
    const fields: HTMLInputElement[] = Array.from(
        form.querySelectorAll(".input-field")
    );
    fields.forEach((input) => reportValidity(input, true));

    const valid = fields.every(($input) => $input.checkValidity());
    return valid;
}

export const getStreamChat = async () => {


    // const {imbueNetworkWebsockAddr, relayChainWebsockAddr, _} = (await fetch(`${config.apiBase}/info`).then(
        // resp => resp.json()
    // ));


    const {_, getstreamApiKey} = (await fetch(`${config.apiBase}/info`).then(
        resp => resp.json()
    ));

    return new StreamChat(getstreamApiKey);
}

function reportValidity(input: HTMLInputElement, submitting: boolean = false) {
    if (input.validity.valueMissing) {
        input.setAttribute("validationmessage", "This field is required.");
    }
    input.reportValidity();
}
