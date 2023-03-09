import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Freelancer, User } from "../models";
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { getStreamChat } from "../utils";

export type ChatProps = {
    user: User;
    freelancer: Freelancer;
};

export const ChatBox = ({ user: user, freelancer: freelancer }: ChatProps): JSX.Element => {
    const client = getStreamChat();

    if (client) {
        const currentChannel = `${user.display_name} (${user.username}) <> ${freelancer.display_name} ${freelancer.username}`;
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
            members: [user.username, freelancer.username],
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

