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
import { Skeleton } from "@mui/material";

export type ChatProps = {
    user: User;
    targetUser: User;
    setShowMessageBox: Function;
    showMessageBox: boolean;
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
                    <span className="header-pound font-bold text-lg w-1/2">
                        {chatTitle.length > 22 ? `${chatTitle?.substring(0, 22)}...` : chatTitle}
                    </span>
                </div>
            </div>
        </div>
    );
};

function CustomSkeletonLoading(){
    return (
        <div className="h-full">
            <div className="w-full flex gap-3 items-center pl-2 pr-8 py-2 str-chat__channel-header">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '16rem' }} />
            </div>

            <div className="flex flex-col justify-evenly px-3 h-full">
                {
                    [...Array(4).keys()].map((value, index) => (
                        <div className={`flex gap-2 ${index % 2 == 1 && "flex-row-reverse"}`}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <div>
                                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '6rem', marginLeft: `${index%2==1 ? "auto" : "0"}` }} />
                                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '16rem' }} />
                            </div>

                        </div>
                    ))
                }
            </div>

            <div className="w-full flex justify-evenly items-center absolute bottom-0 str-chat__channel-header">
                <Skeleton variant="text" sx={{ fontSize: '2rem', width: "20rem" }} />
                <Skeleton variant="circular" width={30} height={30} />
            </div>
        </div>
    )
}

export const ChatBox = ({ user, targetUser, showMessageBox, setShowMessageBox }: ChatProps) => {
    const [content, setContent] = useState<any>(<CustomSkeletonLoading/>)

    useEffect(() => {
        async function setup() {
            try {
                const client = await getStreamChat();

                if (client) {
                    const currentChannel = `${targetUser.display_name} ${targetUser.username}`;

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

                    await channel.watch()

                    setContent(<Chat client={client} theme="str-chat__theme-dark">
                        <Channel channel={channel}>
                            <Window>
                                <div className="">
                                    <div className="w-5 cursor-pointer absolute top-2 right-1 z-10 font-semibold" onClick={() => setShowMessageBox(false)}>x</div>
                                    <CustomChannelHeader />
                                </div>
                                <MessageList />
                                <div className="border-t border-t-white border-opacity-25">
                                    <MessageInput />
                                </div>
                            </Window>
                            <Thread />
                        </Channel>
                    </Chat>)
                }
            } catch (error) {
                console.log(error);
                setContent(<p>GETSTREAM

_API_KEY not found</p>)
            }

        }
        setup();
    }, [user, targetUser, showMessageBox]);

    return content
};
