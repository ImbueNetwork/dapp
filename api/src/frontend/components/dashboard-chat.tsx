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
import { getStreamChat } from "../utils";
import "../Styles/dashboard.css";

import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { BottomNavigation, BottomNavigationAction, TextField } from "@mui/material";
import EnhancedTable from "./dashboard-activities";

export type DashboardProps = {
    user: User;
};

export const DashboardChat = ({ user }: DashboardProps): JSX.Element => {
    const [client, setClient] = useState<StreamChat>();
    const filters = { members: { $in: [user.username] } };
    const [selectedOption, setSelectedOption] = useState<number>(1)
    const [unreadMessages, setUnreadMsg] = useState<number>(0)

    // TODO: get client's all brief 
    const briefs = [
        {id:1, name: "C++ Network Experts for banking app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 300, created: "20th Frebruary, 2022", applications: 30, completedMilestones:3, totalMilestones:4, condition:"Accepted"},
        {id:2, name: "Crypto app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 400, created: "22th Frebruary, 2022", applications: 20, completedMilestones:1, totalMilestones:4, condition:"Pending"},
        {id:3, name: "Finance banking app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 500, created: "10th March, 2022", applications: 3, completedMilestones:3, totalMilestones:4, condition:"Rejected"},
        {id:4, name: "Defi app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 3200, created: "2nd Frebruary, 2022", applications: 13, completedMilestones:4, totalMilestones:4, condition:"Accepted"},
        {id:5, name: "Blockchain app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 1300, created: "10th Janusary, 2022", applications: 50, completedMilestones:3, totalMilestones:4, condition:"Accepted"},
        {id:6, name: "ChatGPT app",description: "How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. Use words that describe what what your NFT is about and how owning it will elicit a certain feeling..........How can you help a potential buyer can't hold' your products online? Help your reader imagine what it would be like to own your NFT. U", budget: 500, created: "25th May, 2022", applications: 3, completedMilestones:4, totalMilestones:4, condition:"Expired"},
    ]

    useEffect(() => {
        async function setup() {
            setClient(await getStreamChat());
        }
        setup();
    }, []);

    useEffect(()=>{
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
    },[client])    

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
                    borderRadius:"10px",
                    border: "1px solid white",
                    marginBottom: '36px',
                    overflow:"hidden"
                }}>
                <BottomNavigationAction label="Client View" value={1} />
                <BottomNavigationAction label={`Messages ${unreadMessages>0 ? `(${unreadMessages})` : ""}`} value={2} />
                <BottomNavigationAction label="Freelancer View" value={3} />
            </BottomNavigation>
            {
                selectedOption === 1 && 
               <>
                <div className="pt-3 mb-8">
                    <h2 className="ml-4 mb-3 font-bold text-xl">Open Briefs</h2>
                    <EnhancedTable data={briefs} titles={["name", "created", "budget", "applications"]}/>
                </div>
                <div className="pt-3">
                    <h2 className="ml-4 mb-3 font-bold text-xl">Ongoing Projects</h2>
                    <EnhancedTable data={briefs} titles={["name", "created", "budget", "applications"]}/>
                </div>
               </>
            }
            {
                selectedOption === 2 && <ChatBox client={client} filters={filters}/>
            }
            {
                selectedOption === 3 && <>
                <div className="pt-3 mb-8">
                    <h2 className="ml-4 mb-3 font-bold text-xl">Working Projects</h2>
                    <EnhancedTable data={briefs} titles={["name", "created", "budget", "milestones"]}/>
                </div>
                <div className="pt-3">
                    <h2 className="ml-4 mb-3 font-bold text-xl">Applied Projects</h2>
                    <EnhancedTable data={briefs} titles={["name", "created", "budget", "condition"]}/>
                </div>
               </>
            }
        </div>
    ) : (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

function ChatBox ({client, filters}:{client:StreamChat, filters:object}) {
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

function CustomChannelHeader (props: ChannelHeaderProps) {
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