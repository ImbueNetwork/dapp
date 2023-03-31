import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer, User } from "../models";
import { StreamChat } from "stream-chat";
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
    ChannelHeaderProps,
    useChatContext,
    useChannelStateContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { getStreamChat } from "../utils";

export type ChatProps = {
    user: User;
    targetUser: User;
};

export function CustomChannelHeader(props: ChannelHeaderProps) {
    const { title } = props;
    const { channel, members = {}, watcher_count, watchers } = useChannelStateContext();
    const { client, setActiveChannel } = useChatContext();
    let chatTitle = "Not Found"

    const membersCount = Object.keys(members).length;

    Object.keys(members).forEach(function (key, index) {
        if (membersCount === 2 && key !== client.userID) chatTitle = key
    })

    return (
        <div className="py-3 border-b border-b-white border-opacity-25">
            <div className="w-full flex gap-3 items-center ml-3">
                <div className="relative">
                    <img
                        src="/public/profile-image.png"
                        className="w-12 h-12 rounded-full object-cover object-top"
                        alt=""
                    />
                    {watcher_count && watcher_count >= 2 && <div className="h-4 w-4 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-black"></div>}
                </div>
                <div className="flex flex-col items-start">
                    <span className="header-pound font-bold text-lg">
                        {chatTitle}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const ChatBox = ({ user, targetUser }: ChatProps) => {
    const [client, setClient] = useState<StreamChat>();

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
    }, []);

    if (client) {
        const currentChannel = `${user.display_name} (${user.username}) <> ${targetUser.display_name} ${targetUser.username}`;

        client.connectUser(
            {
                id: user.username,
                name: user.display_name,
            },
            user.getstream_token
        );

        const channel = client.channel("messaging", {
            image: "https://www.drupal.org/files/project-images/react.png",
            name: currentChannel,
            members: [user.username, targetUser.username],
        });

        return (
            <Chat client={client} theme="str-chat__theme-dark">
                <Channel channel={channel}>
                    <Window>
                        <div className="pl-2 pr-8 py-2 border-b border-b-white">
                            <ChannelHeader />
                        </div>
                        <MessageList />
                        <div className="border-t border-t-white">
                            <MessageInput />
                        </div>
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        );
    }

    return <p>REACT_APP_GETSTREAM_API_KEY not found</p>;
};
