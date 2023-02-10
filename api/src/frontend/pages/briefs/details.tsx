import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Brief, Freelancer, User } from "../../models";
import { TagsInput } from "../../components/tagsInput";
import * as utils from "../../utils";
import { FreelancerService } from "../../services/freelancerService";
import "../../../../public/new-freelancer.css";
import { Briefs } from ".";
import { getBrief } from "../../services/briefsService";

const freelancerService = new FreelancerService();

export type BriefProps = {
    brief?: Brief;
};

export const BriefDetails = ({ brief: brief }: BriefProps): JSX.Element => {
    return (
        <h1>Test</h1>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    let briefId = window.location.pathname.split('/').pop();

    console.log("briefID is ", briefId);
    if(briefId) {
        const brief = await getBrief(briefId);

        console.log(brief);
        ReactDOMClient.createRoot(
            document.getElementById("brief-details")!
        ).render(<BriefDetails brief={brief} />);
    }

});
