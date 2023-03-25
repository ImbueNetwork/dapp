import React from "react";
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import {  ChatBox } from "./";
import { User } from "../models";
import '../Styles/chat-popup.css'

interface ChatPopupProps  {
    showMessageBox:boolean,
    setShowMessageBox: Function,
    browsingUser: User | null,
    targetUser: User | null
}

const ChatPopup = (props:ChatPopupProps) => {
    const {showMessageBox,setShowMessageBox, browsingUser,targetUser} = props
    const chatPopupStyle = {
        position: 'fixed',
        right: '150px',
        bottom: 0,
        width: 400,
        height: "480px",
        bgcolor: '#2c2c2c',
        boxShadow: 24,
    };

    return (
        <Slide direction="up" className="z-10" in={showMessageBox} mountOnEnter unmountOnExit>
            <Box sx={chatPopupStyle}>
                <div className="relative">
                    <div className="w-5 cursor-pointer absolute top-2 right-1 z-10 font-semibold" onClick={() => setShowMessageBox(false)}>x</div>
                    {(browsingUser && targetUser) ? <ChatBox user={browsingUser} targetUser={targetUser} ></ChatBox> : <p>REACT_APP_GETSTREAM_API_KEY not found</p>}
                </div>
            </Box>
        </Slide>
    )
}

export default ChatPopup;