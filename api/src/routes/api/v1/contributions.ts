import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const { hexToU8a, isHex } = require('@polkadot/util');

type ProjectPkg = models.Contribution;

const router = express.Router();

router.get("/:address", (req, res, next) => {
    const address = req.params.address;
    if(!isValidAddressAddress(address))
    {
        throw new Error("Please enter valid address");
    }
    db.transaction(async tx => {
        try {
            const contributions = await models.fetchContributions(address)(tx);
            res.send(contributions);
        } catch (e) {
            next(new Error(
                `Failed to fetch all contribution for the address: ${address}`,
                { cause: e as Error }
            ));
        }
    });
});


router.post("/", (req, res, next) => {
    // if (!req.isAuthenticated()) {
    //     res.status(401).end();
    // }

    try {
        validateContribution(req.body.contribution);
    } catch (e) {
        res.status(400).send(
            { message: (e as Error).message }
        );
    }

    const {
        project_id,
        address,
        amount
    } = req.body.contribution as models.Contribution;

    db.transaction(async tx => {
        try {
            const project = await models.insertContribution({
                project_id,
                address,
                amount
            })(tx);

            if (!project.id) {
                return next(new Error(
                    "Failed to insert contribution: `project_id` missing."
                ));
            }

            // const pkg: ProjectPkg = {
            //     await models.fetchContributions(
            //         id,
            //         project_id,
            //         address,
            //         amount
            //     )(tx)
            // }

            res.status(201).send(project);
        } catch (cause) {
            next(new Error(
                `Failed to insert project.`,
                { cause: cause as Error }
            ));
        }
    });
});


const validateContribution = (contribution: models.Contribution) => {
    if (!contribution) {
        throw new Error("Missing `contribution` entry.");
    }

    const entries = Object.entries(contribution);
    if (entries.filter(([_, v]) => {
        // undefined not allowed
        return v === void 0;
    }).length
    ) {
        throw new Error(
            `Contribution entries can't have a value of \`undefined\`.`
        );
    }
}

const isValidAddressAddress = (address: any) => {
    try {
        encodeAddress(
            isHex(address)
                ? hexToU8a(address)
                : decodeAddress(address)
        );

        return true;
    } catch (error) {
        return false;
    }
};




export default router;
