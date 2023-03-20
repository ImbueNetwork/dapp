import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { getCurrentUser } from "../../utils";
import { User } from "../../models";

import { DashboardChat } from "../../components/dashboard-chat";
import "../../../../public/dashboard.css";

export type DashboardProps = {
    user: User;
};

export const Dashboard = ({ user: user }: DashboardProps): JSX.Element => {
    return (
        <div>
            <DashboardChat user={user}></DashboardChat>
        </div>
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    const user: User = await getCurrentUser();
    ReactDOMClient.createRoot(
        document.getElementById("dashboard")!
    ).render(<Dashboard user={user} />);
});

