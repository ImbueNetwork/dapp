import * as config from "../config";


export type BadRoute =
      "not-found"
    | "not-implemented"
    | "server-error"
    | "bad-route";


export const redirect = (path: string) => {
    window.history.pushState({}, "", `${config.context}${path}`);
    window.dispatchEvent(new Event("popstate"));
};

export const validProjectId = (candidate: any) => {
    return !!Number(String(candidate));
}

export const badRouteEvent = (type: BadRoute) => new CustomEvent(
    config.event.badRoute,
    {
        bubbles: true,
        composed: true,
        detail: type,
    }
);
