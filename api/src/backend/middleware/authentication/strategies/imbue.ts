import express from "express";
import type { Session } from "express-session";
import passport, { use } from "passport";
import { generateGetStreamToken, getOrCreateFederatedUser, updateFederatedLoginUser, updateUserGetStreamToken, User } from "../../../models";
import config from "../../../config";
import db from "../../../db";
import * as models from "../../../models";
import { ensureParams, cookieExtractor, jwtOptions } from "./common"
// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { StreamChat } from 'stream-chat';


const JwtStrategy = passportJwt.Strategy;
export const imbueJsAuthRouter = express.Router();

// @ts-ignore
export const imbueStrategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
    const id = jwt_payload.id;
    try {
        const user = await db.select().from<User>("users").where({ "id": Number(id) }).first();
        if (!user) {
            next(`No user found with id: ${id}`, false);
        } else {
            return next(null, { id: user.id, username: user.username, getstream_token: user.getstream_token, display_name: user.display_name });
        }
    } catch (e) {
        return next(`Failed to deserialize user with id ${id}`, false);
    }
});

imbueJsAuthRouter.post("/", (req, res, next) => {
    const {
        userOrEmail,
        password
    } = req.body;

    db.transaction(async tx => {
        try {
            const user = await models.fetchUserOrEmail(userOrEmail)(tx);
            if (!user) {
                return res.status(404).end();
            }

            if(!user.getstream_token) {
                const token = await generateGetStreamToken(user);
                await updateUserGetStreamToken(user?.id, token)(tx);
            }

            const loginSuccessful = await bcrypt.compare(password, user.password)
            if (!loginSuccessful) {
                return res.status(404).end();
            }

            const payload = { id: user.id };
            const token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.cookie("access_token", token, {
                secure: config.environment !== "development",
                httpOnly: true
            });

            res.send({ id: user.id, display_name: user.display_name });
        } catch (e) {
            next(new Error(
                `Failed to fetch user ${userOrEmail}`,
                { cause: e as Error }
            ));
        }
    });
});

imbueJsAuthRouter.post("/register", (req, res, next) => {
    const {
        username,
        email,
        password
    } = req.body;

    ensureParams(req.body, next, ["username", "email", "password"]);

    db.transaction(async tx => {
        const usernameExists = await models.fetchUserOrEmail(username)(tx);
        const emailExists = await models.fetchUserOrEmail(email)(tx);
        if (usernameExists) {
            return res.status(409).send(JSON.stringify('Username already exists.'));
        } else if (emailExists) {
            return res.status(409).send(JSON.stringify('Email already exists.'));
        } else {
            let updateUserDetails = async (err: Error, user: User) => {
                if (err) {
                    next(err);
                }

                if (!user) {
                    next(new Error("No user provided."));
                }

                db.transaction(async tx => {
                    try {
                        await updateFederatedLoginUser(
                            user, username, email, password
                        )(tx);

                        const payload = { id: user.id };
                        const token = jwt.sign(payload, jwtOptions.secretOrKey);
                        res.cookie("access_token", token, {
                            secure: config.environment !== "development",
                            httpOnly: true
                        });
                        res.send({ id: user.id, display_name: user.display_name });
                    } catch (e) {
                        tx.rollback();
                        next(new Error(
                            `Unable to upsert details for user: ${username}`,
                            { cause: e as Error }
                        ));
                    }
                });
            };

            getOrCreateFederatedUser(
                "Imbue Network",
                username.toLowerCase(),
                username.toLowerCase(),
                updateUserDetails);
        }
    });
});