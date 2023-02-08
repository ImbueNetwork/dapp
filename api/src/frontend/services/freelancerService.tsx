import { Component } from "react";
import { Freelancer } from "../models";
import * as config from "../config";
import { postAPIHeaders } from "../config";

export class FreelancerService {
     public async createFreelancingProfile(freelancer: Freelancer){
        const resp = await fetch(`${config.apiBase}/freelancers/`, {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify({ freelancer }),
        });

        if (resp.ok) {
            // could be 200 or 201
            // Freelancer API successfully invoked
            console.log("Freelancer created successfully via Freelancer REST API");
        }
    }

}