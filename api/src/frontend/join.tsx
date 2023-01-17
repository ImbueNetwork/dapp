import React from 'react';
import * as ReactDOMClient from "react-dom/client";
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';
import "../../public/registration.css"
function Join() {
    return (
        <div id="registration-form" className='registration-container'>

            <div className="contents">
                <div><h1>Sign Up To Imbue Enterprise</h1></div>
                <div>
                    <div>
                    <TextField
                        label="First Name"
                        outlined className="mdc-text-field" required />

                    <TextField
                        label="Last Name"
                        outlined className="mdc-text-field" required />
                    </div>
                </div>
                <div>
                    <TextField
                        label="Email"
                        outlined className="mdc-text-field" required />
                </div>
                <div>
                    <TextField
                        label="Password"
                        type="password"
                        outlined className="mdc-text-field" required />
                </div>
                <div>
                    <TextField
                        label="Confirm Password"
                        type="password"
                        outlined className="mdc-text-field" required />
                </div>
                <div>
                    <button
                        type="submit"
                        className="primary-btn in-dark confirm"
                        id="create-account">
                        Create my account
                    </button>
                </div>
                </div>


        </div>
    );
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById("join")!).render(
        <Join />
    );
});