import React, { useEffect, useRef, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { User } from "../models";
import { StreamChat } from "stream-chat";
import {
    Chat,
    Channel,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { getStreamChat, redirect } from "../utils";
import "../Styles/dashboard.css";
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { BottomNavigation, BottomNavigationAction, StyledEngineProvider, TextField } from "@mui/material";
import { ApplicationContainer } from "../pages/briefs/applications";
import { getBriefApplications, getUserBriefs } from "../services/briefsService";
import { CustomChannelHeader } from "./chat";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export type DashboardProps = {
    user: User;
};

export const DashboardView = ({ user }: DashboardProps): JSX.Element => {
    const [client, setClient] = useState<StreamChat>();
    const filters = { members: { $in: [user.username] } };
    const [selectedOption, setSelectedOption] = useState<number>(1)
    const [unreadMessages, setUnreadMsg] = useState<number>(0)
    const [briefs, setBriefs] = useState<any>({})
    const [briefId, setBriefId] = useState<number>()
    const [applications, setApplications] = useState<any[]>([])

    useEffect(() => {
        const setup = async () => {
            setBriefs(await getUserBriefs(user.id))
        }
        setup();
        const getApplications = async (id) => {
            setApplications(await getBriefApplications(id))
        }
        briefId && getApplications(briefId)
    }, [briefId])

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

    const handleMessageBoxClick = async (user_id) => {
        // TODO: Implement chat popup 
    }

    const redirectToApplication = (applicationId) => {
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
            <StyledEngineProvider injectFirst>
                <BottomNavigation
                    showLabels
                    value={selectedOption}
                    onChange={(event, newValue) => {
                        setSelectedOption(newValue);
                    }}
                >
                    <BottomNavigationAction label="Client View" value={1} />
                    <BottomNavigationAction label={`Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ""}`} value={2} />
                    <BottomNavigationAction label="Freelancer View" value={3} />
                </BottomNavigation>
            </StyledEngineProvider>
            {
                selectedOption === 1 &&
                <div>
                    {
                        briefId
                            ? <div className="list-container relative">
                                <div className="absolute top-2 left-2 cursor-pointer" onClick={() => setBriefId(undefined)}>
                                    <ArrowBackIcon />
                                </div>
                                {
                                    applications?.map((application, index) => (
                                        <ApplicationContainer {...{ application, handleMessageBoxClick, redirectToApplication}} key={index} />
                                    ))
                                }
                            </div>
                            : <div>
                                <h2 className="text-xl font-bold mb-3">Open Briefs</h2>
                                <BriefLists briefs={briefs?.briefsUnderReview} setBriefId={setBriefId} />
                                <h2 className="text-xl font-bold mb-3">Projects</h2>
                                <BriefLists briefs={briefs?.acceptedBriefs} setBriefId={setBriefId} />
                            </div>

                    }
                </div>
            }
            {
                selectedOption === 2 && <ChatBox client={client} filters={filters} />
            }
            {
                selectedOption === 3 &&
                <div className="list-container">
                    {
                        appliedBriefs.map((brief, index) => (
                            <BriefState brief={brief} key={index} />
                        ))
                    }
                </div>
            }
        </div>
    ) : (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

function BriefLists({ briefs = [], setBriefId }: { briefs: any[], setBriefId: Function }) {
    if (briefs?.length === 0) return <h2>Nothing to show</h2>

    const getTimeDifference = (date) => {
        const today: any = new Date()
        const created: any = new Date(date)
        const difference = Math.abs((today - created) / 1000);

        if (difference < 60) return `${Math.ceil(difference)} seconds`
        else if (difference < 3600) return `${Math.ceil(difference / 60)} minutes`
        else if (difference < (3600 * 24)) return `${Math.ceil(difference / (60 * 60))} hours`
        else return `${Math.ceil(difference / (60 * 60 * 24))} days`
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    return (
        <div className="list-container mb-8">
            {
                briefs?.map((brief, index) => (
                    <div
                        key={index}
                        onClick={() => setBriefId(brief.id)}
                        className="list-item-container justify-between">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-bold">{brief.headline}</h3>
                            <p>Budget {formatter.format(brief.budget)} - Public</p>
                            <p>Created {getTimeDifference(brief.created)} ago</p>
                        </div>
                        {
                            brief.projectid
                                ? <div className="flex flex-col items-center">
                                    <h2>Milestones <span className="primary-text">{brief.milestones?.filter((m) => m.is_approved)?.length}/{brief.milestones?.length}</span></h2>
                                    <div className="w-48 bg-[#1C2608] h-1 relative my-auto">
                                    <div
                                        style={{
                                            width: `${(brief.milestones?.filter((m) => m.is_approved)?.length / brief.milestones?.length) * 100}%`
                                        }}
                                        className="h-full rounded-xl Accepted-button absolute">
                                    </div>
                                    <div className="flex justify-evenly">
                                        {
                                            brief.milestones?.map((m) => (<div className={`h-4 w-4 ${m.is_approved ? "Accepted-button" : "bg-[#1C2608]"} rounded-full -mt-1.5`}></div>))
                                        }
                                    </div>
                                </div>
                                </div>
                                : <div className="flex flex-col items-center gap-3">
                                    <h2 className="text-xl font-bold">Proposals</h2>
                                    <h2 className="text-xl font-bold primary-text">{brief.number_of_applications}</h2>
                                </div>
                        }
                    </div>
                ))
            }
        </div>
    )
}

function ChatBox({ client, filters }: { client: StreamChat, filters: object }) {
    return (
        <div className="custom-chat-container w-full rounded-2xl border border-white border-opacity-25 overflow-hidden">
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
                            {/* <ChannelHeader/> */}
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
        <div className="list-item-container h-56 gap-8">
            <div className="w-4/5">
                <h3 className="text-xl font-bold mb-3">{brief?.name}</h3>
                <span>
                    {brief?.description}
                </span>
            </div>
            <div className="flex flex-col justify-evenly items-center ml-auto">
                <span>{brief?.postDate}</span>
                <div className={`px-4 py-2 text-black ${brief?.condition}-button w-fit rounded-full`}>{brief?.condition}</div>
            </div>

        </div>
    )
}
