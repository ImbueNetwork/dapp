import { context } from "../config";


export const redirect = (path: string) => {
    window.history.pushState({}, "", `${context}${path}`);
    window.dispatchEvent(new Event("popstate"));
};
