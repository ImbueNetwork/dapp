import * as config from "../config";
import {Brief, Freelancer} from "../models";
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

export const getAllBriefs = async () => {
    const resp =  await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json() as Array<Brief>
    } else {
        throw new Error('Failed to get all briefs. status:' + resp.status);
    }
  }

