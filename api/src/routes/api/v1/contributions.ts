import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";

type ProjectPkg = models.Contribution;

const router = express.Router();

router.get("/:address", (req, res, next) => {
    const address = req.params.address;
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
        throw new Error("Missing `contribution` entry5.");
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

const isValidAddressPolkadotAddress = (address: any) => {
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


// router.put("/:id", (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         return res.status(401).end();
//     }

//     const id = req.params.id;

//     try {
//         validateProposal(req.body.proposal);
//     } catch (e) {
//         res.status(400).send(
//             {message: (e as Error).message}
//         );
//     }

//     const {
//         name,
//         logo,
//         description,
//         website,
//         category,
//         chain_project_id,
//         required_funds,
//         currency_id,
//         owner,
//         milestones,
//     } = req.body.proposal as models.GrantProposal;

//     const user_id = (req.user as any).id;

//     db.transaction(async tx => {
//         try {
//             // ensure the project exists first
//             const exists = await models.fetchProject(id)(tx);

//             if (!exists) {
//                 return res.status(404).end();
//             }

//             if (exists.user_id !== user_id) {
//                 return res.status(403).end();
//             }

//             const project = await models.updateProject(id, {
//                 name,
//                 logo,
//                 description,
//                 website,
//                 category,
//                 chain_project_id,
//                 required_funds,
//                 currency_id,
//                 owner,
//                 // user_id,
//             })(tx);

//             if (!project.id) {
//                 return next(new Error(
//                     "Cannot update milestones: `project_id` missing."
//                 ));
//             }

//             // drop then recreate
//             await models.deleteMilestones(id)(tx);

//             const pkg: ProjectPkg = {
//                 ...project,
//                 milestones: await models.insertMilestones(
//                     milestones,
//                     project.id,
//                 )(tx)
//             }

//             res.status(200).send(pkg);
//         } catch (cause) {
//             next(new Error(
//                 `Failed to update project.`,
//                 {cause: cause as Error}
//             ));
//         }
//     });
// });


export default router;
