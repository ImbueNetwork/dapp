import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { User } from "../models";

import { StreamChat } from "stream-chat";
import {
    Chat,
    Channel,
    ChannelList,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
    TypingIndicator,
    ChannelHeaderProps,
    useChannelStateContext,
    useChatContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { getStreamChat } from "../utils";
import "../Styles/dashboard.css";

import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { TextField } from "@mui/material";

export type DashboardProps = {
    user: User;
};

export const DashboardChat = ({ user }: DashboardProps): JSX.Element => {
    const [client, setClient] = useState<StreamChat>();
    const filters = { members: { $in: [user.username] } };
    const active = true;

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
    }, []);

    if (client) {
        client.connectUser(
            {
                id: user.username,
                name: user.username,
            },
            user.getstream_token
        );
    }

    const CustomChannelHeader = (props: ChannelHeaderProps) => {
        const { title } = props;
        const { channel, members,watcher_count } = useChannelStateContext();
        const { name, image } = channel?.data || {};
        // const { client:contextClient, channel, setActiveChannel } = useChatContext();
        console.log(watcher_count);
        // console.log(props);

        return (
            <div className="py-5 border border-b-white">
                <div className="w-full flex gap-4 items-center ml-3">
                    {image && (
                        <div className="relative">
                            <img
                                src="/public/profile-image.png"
                                className="w-16 h-16 rounded-full object-cover object-top"
                                alt=""
                            />
                            {watcher_count && watcher_count >=2 && <div className="h-4 w-4 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-black"></div>}
                        </div>
                    )}
                    <div className="flex flex-col items-start">
                        <span className="header-pound font-bold text-lg">
                            {/* {title || name || "No Name Found"} */}
                            Alison Burgers
                        </span>
                        <span className="text-sm">
                            Software Engineer at California
                        </span>
                    </div>
                </div>
                <TypingIndicator />
            </div>
        );
    };

    return client ? (
        <div className="custom-chat-container w-full rounded-2xl border border-white overflow-hidden">
            <Chat client={client} theme="str-chat__theme-dark">
                <div className="flex h-full">
                    <div className="chat-list-container border-r border-r-white">
                        <ChannelList
                            filters={filters}
                            showChannelSearch={true}
                        />
                    </div>

                    <Channel>
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
    ) : (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};
