import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { User } from "../models";

import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { getStreamChat } from "../utils";
import '../Styles/dashboard.css'

import EditIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import { TextField } from "@mui/material";

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
        <div className="custom-chat-container w-full rounded-2xl border border-white overflow-hidden">
            <Chat client={client} theme='str-chat__theme-dark'>
                <div className="flex h-full">
                    <div className="border-r border-r-white">
                        <div className="flex px-12 pt-6 justify-between items-center">
                            <h2 className="font-extrabold flex">Messaging</h2>                    
                            <EditIcon/>
                        </div>
                        <ChannelList 
                        filters={filters} 
                        showChannelSearch={true}/>
                    </div>

                <Channel >
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
                </div>
            </Chat>
        </div>
        : <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

