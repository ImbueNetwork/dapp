import React from "react";
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { ChatBox } from "./";
import { User } from "../models";
import '../Styles/chat-popup.css'
import { StyledEngineProvider } from "@mui/material";

interface ChatPopupProps {
    showMessageBox: boolean,
    setShowMessageBox: Function,
    browsingUser: User | null,
    targetUser: User | null
}

const ChatPopup = (props: ChatPopupProps) => {
    const { showMessageBox, setShowMessageBox, browsingUser, targetUser } = props
    
    return (
        <StyledEngineProvider injectFirst>
            <Slide direction="up" className="z-10" in={showMessageBox} mountOnEnter unmountOnExit>
                <Box>
                    <div className="relative">
                        <div className="w-5 cursor-pointer absolute top-2 right-1 z-10 font-semibold" onClick={() => setShowMessageBox(false)}>x</div>
                        {(browsingUser && targetUser) ? <ChatBox user={browsingUser} targetUser={targetUser} setShowMessageBox={setShowMessageBox} showMessageBox={showMessageBox}></ChatBox> : <p>GETSTREAM

_API_KEY not found</p>}
                    </div>
                </Box>
            </Slide>
        </StyledEngineProvider>
    )
}

export default ChatPopup;