import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { User } from "../models";

import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { getStreamChat } from "../utils";

export type DashboardProps = {
    user: User;
};

export const DashboardChat = ({ user }: DashboardProps): JSX.Element => {
    const [client, setClient] = useState<StreamChat>();
    const filters = { members: { $in: [user.username] } }

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
     }, []);


    if(client) {
        client.connectUser(
            {
                id: user.username,
                name: user.username,
            },
            user.getstream_token,
        );
    }

    return (
        client ?
        <Chat client={client} theme='str-chat__theme-dark'>
            <ChannelList filters={filters} />
            <Channel >
                <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
        </Chat>
        : <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};


