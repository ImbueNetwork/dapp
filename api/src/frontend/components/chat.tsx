import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer, User } from "../models";
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { getStreamChat } from "../utils";

export type ChatProps = {
    user: User;
    targetUser: User;
};

export const ChatBox = ({ user, targetUser }: ChatProps) => {
    const [client, setClient] = useState<StreamChat>();

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
     }, [])

    if (client) {
        const currentChannel = `${user.display_name} (${user.username}) <> ${targetUser.display_name} ${targetUser.username}`;

        client.connectUser(
            {
                id: user.username,
                name: user.display_name,
            },
            user.getstream_token,
        );

        const channel = client.channel('messaging', {
            image: 'https://www.drupal.org/files/project-images/react.png',
            name: currentChannel,
            members: [user.username, targetUser.username],
        });

        return (
            <Chat client={client} theme='str-chat__theme-dark'>
                <Channel channel={channel}>
                    <Window>
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        );
    }

    return (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

