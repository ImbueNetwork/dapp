import React, { useEffect, useRef, useState } from "react";
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
import { getStreamChat, redirect } from "../utils";
import "../Styles/dashboard.css";

import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { BottomNavigation, BottomNavigationAction, TextField } from "@mui/material";
import { ApplicationContainer } from "../pages/briefs/applications";

export type DashboardProps = {
    user: User;
};

export const DashboardChat = ({ user }: DashboardProps): JSX.Element => {
    const [client, setClient] = useState<StreamChat>();
    const filters = { members: { $in: [user.username] } };
    const [selectedOption, setSelectedOption] = useState<number>(1)
    const [unreadMessages, setUnreadMsg] = useState<number>(0)

    // TODO: get client's all brief

    const appliedBriefs = [
        {
            id: 1,
            name: "Product Development Engineer",
            description: "How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. U",
            postDate: "Feb 21, 2023",
            condition: "Accepted"
        },
        {
            id: 1,
            name: "Product Development Engineer",
            description: "How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. U",
            postDate: "Feb 21, 2023",
            condition: "Rejected"
        },
        {
            id: 1,
            name: "Product Development Engineer",
            description: "How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. U",
            postDate: "Feb 21, 2023",
            condition: "Rejected"
        },
        {
            id: 1,
            name: "Product Development Engineer",
            description: "How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can’t ‘hold’ your products online? Help your reader imagine what it would be like to own your NFT. U",
            postDate: "Feb 21, 2023",
            condition: "Accepted"
        },
    ]

    const applications = [
        {
            id: 1,
            user_id: 1014,
            freelancer: { username: "Sam", title: "Web3 Developer", bio: "Hello, I would like to help you! I have 4+ years Experience with web 3, so i’ll make things work properly. Feel free to communicate!" },
            milestones: [{is_approved:true}, {is_approved:true}, {is_approved:true}, {is_approved:false}],
            required_funds: 23000,
        },
        {
            id: 1,
            user_id: 1014,
            freelancer: { username: "Sam", title: "Web3 Developer", bio: "Hello, I would like to help you! I have 4+ years Experience with web 3, so i’ll make things work properly. Feel free to communicate!" },
            milestones: [{is_approved:true}, {is_approved:true}, {is_approved:true}, {is_approved:false}],
            required_funds: 23000,
        },
        {
            id: 1,
            user_id: 1014,
            freelancer: { username: "Sam", title: "Web3 Developer", bio: "Hello, I would like to help you! I have 4+ years Experience with web 3, so i’ll make things work properly. Feel free to communicate!" },
            milestones: [{is_approved:true}, {is_approved:true}, {is_approved:true}, {is_approved:false}],
            required_funds: 23000,
        },
        {
            id: 1,
            user_id: 1014,
            freelancer: { username: "Sam", title: "Web3 Developer", bio: "Hello, I would like to help you! I have 4+ years Experience with web 3, so i’ll make things work properly. Feel free to communicate!" },
            milestones: [{is_approved:true}, {is_approved:true}, {is_approved:true}, {is_approved:false}],
            required_funds: 23000,
        },
    ]

    const handleMessageBoxClick = async (user_id) => {
        // TODO: Implement chat popup 
    }

    const redirectToApplication = (applicationId) => {
        // TODO: need brief id
        const briefId = 1
        redirect(`briefs/${briefId}/applications/${applicationId}/`);
    };

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
    }, []);

    useEffect(() => {
        if (client) {
            client.connectUser(
                {
                    id: user.username,
                    name: user.username,
                },
                user.getstream_token
            );

            client.on((event) => {
                if (event.total_unread_count !== undefined) {
                    setUnreadMsg(event.total_unread_count);
                }
            });

        }
    }, [client])

    return client ? (
        <div className="-mt-8">
            <BottomNavigation
                showLabels
                value={selectedOption}
                onChange={(event, newValue) => {
                    setSelectedOption(newValue);
                }}
                sx={{
                    bgcolor: "#2c2c2c",
                    borderRadius: "10px",
                    border: "1px solid white",
                    marginBottom: '36px',
                    overflow: "hidden"
                }}>
                <BottomNavigationAction label="Client View" value={1} />
                <BottomNavigationAction label={`Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ""}`} value={2} />
                <BottomNavigationAction label="Freelancer View" value={3} />
            </BottomNavigation>
            {
                selectedOption === 1 &&
                <>
                    <div className="bg-[#2c2c2c] rounded-xl border border-white">
                        {
                            applications.map((application, index) => (
                                <ApplicationContainer {...{ application, handleMessageBoxClick, redirectToApplication, view: "client" }} />
                            ))
                        }
                    </div>
                </>
            }
            {
                selectedOption === 2 && <ChatBox client={client} filters={filters} />
            }
            {
                selectedOption === 3 &&
                <>
                    <div className="bg-[#2c2c2c] rounded-xl border border-white">
                        {
                            appliedBriefs.map((brief, index) => (
                                <BriefState brief={brief}/>
                            ))
                        }
                    </div>
                </>
            }
        </div>
    ) : (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

function ChatBox({ client, filters }: { client: StreamChat, filters: object }) {
    return (
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
                            <CustomChannelHeader />
                            <MessageList />
                            <MessageInput />
                        </Window>
                        <Thread />
                    </Channel>
                </div>
            </Chat>
        </div>
    )
}

function BriefState({ brief }) {
    return (
        <div className="flex h-64 gap-8 px-9 py-12 border-b last:border-b-0 border-b-white">
            <div className="w-4/5">
                <h3 className="text-xl font-bold mb-3">{brief?.name}</h3>
                <span>
                    {brief?.description}
                </span>
            </div>
            <div className="flex flex-col justify-between items-center ml-auto">
                <span>{brief?.postDate}</span>
                <div className={`px-4 py-2 text-black ${brief?.condition}-button w-fit rounded-full`}>{brief?.condition}</div>
            </div>

        </div>
    )
}

function CustomChannelHeader(props: ChannelHeaderProps) {
    const { title } = props;
    const { channel, members, watcher_count } = useChannelStateContext();
    const { name, image } = channel?.data || {};

    return (
        <div className="py-3 border border-b-white">
            <div className="w-full flex gap-4 items-center ml-3">
                {image && (
                    <div className="relative">
                        <img
                            src="/public/profile-image.png"
                            className="w-16 h-16 rounded-full object-cover object-top"
                            alt=""
                        />
                        {watcher_count && watcher_count >= 2 && <div className="h-4 w-4 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-black"></div>}
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