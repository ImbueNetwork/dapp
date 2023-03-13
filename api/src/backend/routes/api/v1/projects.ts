import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";


type ProjectPkg = models.Project & {
    milestones: models.Milestone[]
}

/**
 * FIXME: all of this is terriblme
 */

const router = express.Router();

router.get("/", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const projects = await models.fetchAllProjects()(tx);
            res.send(projects);
        } catch (e) {
            next(new Error(
                `Failed to fetch all projects`,
                {cause: e as Error}
            ));
        }
    });
});


router.get("/:id", (req, res, next) => {
    const id = req.params.id;

    db.transaction(async tx => {
        try {
            const project = await models.fetchProject(id)(tx);

            if (!project) {
                return res.status(404).end();
            }

            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.fetchProjectMilestones(id)(tx)
            };

            res.send(pkg);
        } catch (e) {
            next(new Error(
                `Failed to fetch project by id: ${id}`,
                {cause: e as Error}
            ));
        }
    });
});

router.post("/", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const {
        name,
        logo,
        description,
        website,
        category,
        required_funds,
        currency_id,
        owner,
        milestones,
        brief_id,
        total_cost_without_fee,
        imbue_fee,
    } = req.body;
    
    db.transaction(async tx => {
        try {
            const project = await models.insertProject({
                name,
                logo,
                description,
                website,
                category,
                required_funds,
                currency_id,
                owner,
                user_id: (req.user as any).id,
                brief_id,
                total_cost_without_fee,
                imbue_fee,
            })(tx);
    
            if (!project.id) {
                return next(new Error(
                    "Failed to insert milestones: `project_id` missing."
                ));
            }

            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.insertMilestones(
                    milestones,
                    project.id,
                )(tx)
            }
    
            res.status(201).send(pkg);
        } catch (cause) {
            next(new Error(
                `Failed to insert project.`,
                {cause: cause as Error}
            ));
        }
    });
});

router.put("/:id", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;
    const {
        name,
        logo,
        description,
        website,
        category,
        required_funds,
        currency_id,
        chain_project_id,
        owner,
        milestones,
        total_cost_without_fee,
        imbue_fee,
    } = req.body;


    const user_id = (req.user as any).id;

    db.transaction(async tx => {
        try {
            // ensure the project exists first
            const exists = await models.fetchProject(id)(tx);

            if (!exists) {
                return res.status(404).end();
            }

            if (exists.user_id !== user_id) {
                return res.status(403).end();
            }

            const project = await models.updateProject(id, {
                name,
                logo,
                description,
                website,
                category,
                chain_project_id,
                required_funds,
                currency_id,
                owner,
                total_cost_without_fee,
                imbue_fee
            })(tx);
    
            if (!project.id) {
                return next(new Error(
                    "Cannot update milestones: `project_id` missing."
                ));
            }
    
            // drop then recreate
            await models.deleteMilestones(id)(tx);

            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.insertMilestones(
                    milestones,
                    project.id,
                )(tx)
            }
    
            res.status(200).send(pkg);
        } catch (cause) {
            next(new Error(
                `Failed to update project.`,
                {cause: cause as Error}
            ));
        }
    });
});

const validateProperties = (properties: models.ProjectProperties) => {
    if (!properties) {
        throw new Error("Missing `properties` entry.");
    }

    const entries = Object.entries(properties);
    if (entries.filter(([_,v]) => {
            // undefined not allowed
            return v === void 0;
        }).length
    ) {
        throw new Error(
            `Project property entries can't have a value of \`undefined\`.`
        );
    }
}

router.get('/:id/properties', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;

    db.transaction(async tx => {
        try {
            const project = await models.fetchProjectWithProperties(id)(tx);

            if (!project) {
                return res.status(404).end();
            }

            res.send(project);
        } catch (e) {
            next(new Error(
                `Failed to fetch project by id: ${id}`,
                {cause: e as Error}
            ));
        }
    });
});

router.put("/:id/properties", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;

    try {
        validateProperties({ ...req.body.properties, project_id: id });
    } catch (e) {
        res.status(400).send(
            {message: (e as Error).message}
        );
    }

    const {
        faq
    } = req.body.properties as models.ProjectProperties;

    db.transaction(async tx => {
        try {
            // ensure the project exists first
            const exists = await models.fetchProject(id)(tx);

            if (!exists) {
                return res.status(404).end();
            }

            const updated = await models.updateProjectProperties(id, {
                faq
            } as models.ProjectProperties)(tx);
    
            res.status(200).send({
                ...exists,
                properties: updated
            });
        } catch (cause) {
            next(new Error(
                `Failed to update project properties.`,
                {cause: cause as Error}
            ));
        }
    });
});


export default router;
