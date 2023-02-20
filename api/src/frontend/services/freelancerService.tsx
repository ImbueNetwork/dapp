import { Component } from "react";
import { Freelancer } from "../models";
import * as config from "../config";
import { postAPIHeaders, getAPIHeaders } from "../config";

export async function createFreelancingProfile(freelancer: Freelancer) {
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

export async function getFreelancerProfile(username: string) {
    const resp =  await fetch(`${config.apiBase}/freelancers/${username}`, {
        headers: getAPIHeaders,
        method: "get",
    })
    if (resp.ok) {
        return await resp.json() as Freelancer
    } else {
        throw new Error('Failed to get freelancer profile. status:' + resp.status);
    }
}


export async function freelancerExists(username: string): Promise<boolean> {
    const resp =  await fetch(`${config.apiBase}/freelancers/${username}`, {
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
    // VALIDATION needed
    const resp =  await fetch(`${config.apiBase}/freelancers/${freelancer.username}`, {
        headers: postAPIHeaders,
        method: "put",
        body: JSON.stringify({freelancer})
    })

    if (resp.ok) {
        console.log("Freelancer updated successfully.");
        return await resp.json() as Freelancer

    } else {
        throw new Error('Failed to update freelancer profile. status:' + resp.status);

    }

}

export async function delete_freelancer(freelancer: Freelancer) {
    // TODO!
    // const resp =  await fetch(`${config.apiBase}/freelancers/${freelancer.username}`, {
    //     headers: getAPIHeaders,
    //     method: "put",
    //     body: JSON.stringify({freelancer})
    // })
// 
    // console.log("Freelancer updated successfully.");
}