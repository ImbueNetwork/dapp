import { Freelancer, FreelancerSqlFilter } from "../models";
import * as config from "../config";
import { postAPIHeaders, getAPIHeaders } from "../config";

export async function createFreelancingProfile(freelancer: any) {
    // Check that this user doesnt already have a freelancer profile.
    const resp = await fetch(`${config.apiBase}/freelancers/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({ freelancer }),
    });
    if (resp.ok) {
        // could be 200 or 201
        // Freelancer API successfully invoked
        console.log("Freelancer created successfully via Freelancer REST API");
    } else {
        throw new Error('Failed to create freelancer profile. status:' + resp.status);

    }
}

export const getAllFreelancers = async () => {
    const resp = await fetch(`${config.apiBase}/freelancers/`, {
        headers: postAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return await resp.json() as Array<Freelancer>
    } else {
        throw new Error('Failed to get all briefs. status:' + resp.status);
    }
}

export async function getFreelancerProfile(username: string) {
    const resp = await fetch(`${config.apiBase}/freelancers/${username}`, {
        headers: getAPIHeaders,
        method: "get",
    })
    if (resp.ok) {
        return await resp.json() as Freelancer
    }
}

export async function freelancerExists(username: string): Promise<boolean> {
    const resp = await fetch(`${config.apiBase}/freelancers/${username}`, {
        headers: getAPIHeaders,
        method: "get",
    })

    if (resp.ok) {
        return true
    } else {
        return false
    }
}

export async function updateFreelancer(freelancer: Freelancer) {
    const resp = await fetch(`${config.apiBase}/freelancers/${freelancer.username}`, {
        headers: postAPIHeaders,
        method: "put",
        body: JSON.stringify({ freelancer })
    })

    if (resp.ok) {
        console.log("Freelancer updated successfully.");
        return await resp.json() as Freelancer

    } else {
        throw new Error('Failed to update freelancer profile. status:' + resp.status);

    }

}

export const callSearchFreelancers = async (filter: FreelancerSqlFilter) => {
    const resp = await fetch(`${config.apiBase}/freelancers/search`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify(filter),
    });
    if (resp.ok) {
        return await resp.json() as Array<Freelancer>
    } else {
        throw new Error('Failed to search freelancers. status:' + resp.status);
    }
}