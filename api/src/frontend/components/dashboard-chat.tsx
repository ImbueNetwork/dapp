import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { User } from "../models";

import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, ChannelHeader, MessageInput, MessageList, Thread, Window, TypingIndicator, ChannelHeaderProps, useChannelStateContext } from 'stream-chat-react';
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


    const CustomChannelHeader = (props: ChannelHeaderProps) => {
        const { title } = props;      
        const { channel } = useChannelStateContext();
        const { name,image } = channel?.data || {};
        console.log(channel?.data);
      
        return (
          <div className='pt-5'>
              <div className='w-full flex flex-col gap-2 items-center'>
                {image && <img src={image} className="w-20 h-20 rounded-full object-cover object-top" alt="" />}
                <span className='header-pound'>{title || name || "No Name Found"}</span>
              </div>
              {/* <TypingIndicator /> */}
          </div>
        );
      };



    return (
        client ?
        <div className="custom-chat-container w-full rounded-2xl border border-white overflow-hidden">
            <Chat client={client} theme='str-chat__theme-dark'>
                <div className="flex h-full">
                    <div className="chat-list-container border-r border-r-white">
                        <ChannelList 
                        filters={filters} 
                        showChannelSearch={true}/>
                    </div>

                <Channel >
                    <Window>
                        {/* <ChannelHeader /> */}
                        <CustomChannelHeader />
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

