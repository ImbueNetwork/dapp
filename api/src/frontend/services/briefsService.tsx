import * as config from "../config";
import { Brief, Freelancer, Project } from "../models";
import { BriefSqlFilter } from "../models";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export const callSearchBriefs = async (filter: BriefSqlFilter) => {
    const resp = await fetch(`${config.apiBase}/briefs/search`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify(filter),
    });
    if (resp.ok) {
        return await resp.json() as Array<Brief>
    } else {
        throw new Error('Failed to search briefs. status:' + resp.status);
    }
}

export const getBrief = async (briefId: number | string) => {
    const resp = await fetch(`${config.apiBase}/briefs/${briefId}`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json() as Brief
    } else {
        throw new Error('Failed to get all briefs. status:' + resp.status);
    }
}

export const getAllBriefs = async () => {
    const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json() as Array<Brief>
    } else {
        throw new Error('Failed to get all briefs. status:' + resp.status);
    }
}

export const getUserBrief = async (userId, briefId) => {
    const resp = await fetch(`${config.apiBase}/users/${userId}/briefs/${briefId}`);
    if (resp.ok) {
        return resp.json();
    }
    return null;
};

export const getUserBriefs = async (user_id) => {
    const resp = await fetch(`${config.apiBase}/users/${user_id}/briefs/`, {
        headers: postAPIHeaders,
        method: "get",
    })
    if (resp.ok) {
        return await resp.json()
    } else {
        throw new Error(`Failed to get all briefs for user ${user_id}. status: ${resp.status}`);
    }
}

export const getBriefApplications = async (brifId: string | number) => {
    const resp = await fetch(`${config.apiBase}/briefs/${brifId}/applications`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json()
    } else {
        throw new Error('Failed to get all brief applications. status:' + resp.status);
    }

}