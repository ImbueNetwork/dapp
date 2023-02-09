import React from "react";
import { useRef, useState, useEffect } from "react";
import * as ReactDOMClient from "react-dom/client";
import { TextField } from "@rmwc/textfield";
import "@rmwc/textfield/styles";
import "../../public/registration.css";
import bcrypt from "bcryptjs";
import * as config from "./config";
import * as utils from "./utils";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export const Join = (): JSX.Element => {
    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [matchPassword, setMatchPassword] = useState("");
    const [error, setError] = useState("");

    const salt = bcrypt.genSaltSync(10);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const hashedPassword = bcrypt.hashSync(password, salt);

        var body = {
            username: user,
            email: email,
            password: hashedPassword,
        };

        const resp = await fetch(`/auth/imbue/register`, {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify(body),
        });

        if (resp.ok) {
            await utils.redirectBack();
        } else {
            const error = await resp.json();
            setError(error);
        }
    };

    return (
        <form
            id="contribution-submission-form"
            name="contribution-submission-form"
            method="get"
            onSubmit={handleSubmit}
        >
            <div id="registration-form" className="registration-container">
                <div className="contents">
                    <div>
                        <h1>Sign up</h1>
                    </div>

                    <div>
                        <TextField
                            value={user}
                            onChange={(e: any) => setUser(e.target.value)}
                            type="text"
                            pattern="^[A-z][A-z0-9-_]{3,23}$"
                            label="Username"
                            outlined
                            className="mdc-text-field"
                            required
                        />
                    </div>

                    <div>
                        <TextField
                            type="email"
                            label="Email"
                            onChange={(e: any) => setEmail(e.target.value)}
                            outlined
                            className="mdc-text-field"
                            required
                        />
                    </div>
                    <div>
                        <TextField
                            label="Password"
                            helpText="Min 8 chars, at least one uppercase, lowercase, number and one special character"
                            onChange={(e: any) => setPassword(e.target.value)}
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            type="password"
                            outlined
                            className="mdc-text-field"
                            required
                        />
                    </div>
                    <div>
                        <TextField
                            label="Confirm Password"
                            invalid={
                                matchPassword.length > 0 &&
                                password != matchPassword
                            }
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            onChange={(e: any) =>
                                setMatchPassword(e.target.value)
                            }
                            helpText={
                                password != matchPassword
                                    ? "Please match password"
                                    : ""
                            }
                            type="password"
                            outlined
                            className="mdc-text-field"
                            required
                        />
                    </div>
                    <div>
                        <span className={!error ? "hide" : "error"}>
                            {error}
                        </span>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={password != matchPassword}
                            className="primary-btn in-dark confirm"
                            id="create-account"
                        >
                            Create my account
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById("join")!).render(
        <Join />
    );
});
