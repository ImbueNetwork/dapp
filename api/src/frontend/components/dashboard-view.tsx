import React, { useEffect, useRef, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Project, ProjectStatus, User } from "../models";
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
import { getFreelancerApplications } from "../services/freelancerService";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
const timeAgo = new TimeAgo("en-US");

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
    const [briefApplications, setBriefApplications] = useState<Project[]>([])
    const [myApplications, setMyApplications] = useState<Project[]>([])

    useEffect(() => {
        const setup = async () => {
            const myApplications = await getFreelancerApplications(user.id);
            setMyApplications(myApplications);
            setBriefs(await getUserBriefs(user.id))
        }
        setup();
        const getApplications = async (id) => {
            setBriefApplications(await getBriefApplications(id))
        }
        briefId && getApplications(briefId)
    }, [briefId])


    const handleMessageBoxClick = async (user_id) => {
        // TODO: Implement chat popup 
    }

    const redirectToBriefApplications = (applicationId) => {
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
                                    briefApplications?.map((application, index) => (
                                        <ApplicationContainer {...{ application, handleMessageBoxClick, redirectToApplication: redirectToBriefApplications }} key={index} />
                                    ))
                                }
                            </div>
                            : <div>
                                <h2 className="text-xl font-bold mb-3">Open Briefs</h2>
                                <BriefLists briefs={briefs?.briefsUnderReview} setBriefId={setBriefId} showNewBriefButton={true} />
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
                < MyFreelancerApplications myApplications={myApplications} />
            }
        </div>
    ) : (
        <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    );
};

function BriefLists({ briefs = [], setBriefId,showNewBriefButton }: { briefs: any[], setBriefId: Function, showNewBriefButton?: Boolean }) {
    const redirectToNewBrief = () => {
        redirect(`briefs/new`);
    };

    if (briefs?.length === 0 && showNewBriefButton) return <button onClick={() => { redirectToNewBrief() }} className="primary-btn in-dark w-button w-1/3" style={{ textAlign: "center" }} >Post Brief</button>
    if (briefs?.length === 0 && !showNewBriefButton) return <h2>Nothing to show</h2>

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
                            <p>Budget ${Number(brief.budget).toLocaleString()} - Public</p>
                            <p>Created {timeAgo.format(new Date(brief.created))}</p>
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

function MyFreelancerApplications({ myApplications }) {

    const redirectToApplication = (application) => {
        redirect(`briefs/${application.brief_id}/applications/${application.id}/`);
    };

    const redirectToDiscoverBriefs = () => {
        redirect(`briefs/`);
    };

    if (myApplications?.length === 0) return <button onClick={() => { redirectToDiscoverBriefs() }} className="primary-btn in-dark w-button w-1/3" style={{ textAlign: "center" }} >Discover Briefs</button>


    return (
        <div className="list-container">
            {
                myApplications.map((application, index) => (
                    <div key={index}
                        onClick={() => redirectToApplication(application)}

                        className="list-item-container h-56 gap-8">
                        <div className="w-4/5">
                            <h3 className="text-xl font-bold mb-3">{application?.name}</h3>
                        </div>
                        <div className="flex flex-col justify-evenly items-center ml-auto">
                            <span>{timeAgo.format(new Date(application.created))}</span>
                            <div className={`px-4 py-2 text-black ${ProjectStatus[application.status_id]}-button w-fit rounded-full`}>{ProjectStatus[application.status_id]}</div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
