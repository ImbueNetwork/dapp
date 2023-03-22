import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import "../../../public/application-preview.css";

export const HirePopup = ({ freelancer, milestones, totalCostWithoutFee, imbueFee, totalCost }) => {
    const [openPopup, setOpenPopup] = React.useState(false);

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: "65vw",
        height: "auto",
        bgcolor: '#2c2c2c',
        color: '#fff',
        pt: '28px',
        pb: '28px',
        boxShadow: 24,
        borderRadius: '20px'
    };

    return (
        <>
            <div className="flex items-center justify-evenly">
                <img className="w-16 h-16 rounded-full object-cover" src='/public/profile-image.png' alt="" />
                <div className="">
                    <p className="text-xl font-bold">{freelancer?.display_name}</p>
                    <p className="text-base underline mt-2">View Full Profile</p>
                </div>
                <div>
                    <p className="text-xl">@{freelancer?.username}</p>
                </div>
                <div>
                    <button className="primary-btn rounded-full w-button dark-button">Message</button>
                    <button onClick={() => setOpenPopup(true)} className="primary-btn in-dark w-button">Hire</button>
                </div>
            </div>

            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}>
                <Fade in={openPopup}>
                    <Box sx={modalStyle}>
                        <div className="relative modal-container">
                            <div className="flex w-full justify-start items-center gap-11 px-16 pb-2">
                                <img className="w-16 h-16 rounded-full object-cover" src='/public/profile-image.png' alt="" />
                                <span className="text-xl font-bold">{freelancer?.display_name}</span>
                            </div>
                            <p className="absolute top-0 text-center w-full text-xl font-bold" style={{ color: "#a4ff00" }}>Hire This Freelancer</p>
                            <hr className="separator" />

                            <div className="milestone-list ml-7 mr-16 mb-5">
                                {milestones.map(({ name, amount }, index) => {
                                    return (
                                        <div className="milestone-row" key={index}>
                                            <div className="milestone-no">
                                                {index + 1}
                                            </div>
                                            <div className="input-wrappers">
                                                <div className="description-wrapper">
                                                    <h3>Description</h3>
                                                    <p>{milestones[index]?.name}</p>
                                                </div>
                                                <div className="budget-wrapper">
                                                    <h3>Amount</h3>
                                                    <p>{milestones[index]?.amount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                                <hr className="separator" />

                            <div className="">
                                <div className="budget-info mx-16 mt-7">
                                    <div className="budget-description">
                                        <h3>Total price of the project</h3>
                                        <div className="text-inactive">
                                            This includes all milestonees, and is the amount
                                            client will see
                                        </div>
                                    </div>
                                    <div className="budget-value">
                                        ${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
                                    </div>
                                </div>
                                <div className="budget-info mx-16">
                                    <div className="budget-description">
                                        <h3>
                                            Imbue Service Fee 5% - Learn more about Imbue’s
                                            fees
                                        </h3>
                                    </div>
                                    <div className="budget-value">
                                        ${Number((imbueFee).toFixed(2)).toLocaleString()}
                                    </div>
                                </div>
                                <div className="budget-info mx-16">
                                    <div className="budget-description">
                                        <h3>Total</h3>
                                    </div>
                                    <div className="budget-value">
                                        ${Number((totalCost).toFixed(2)).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <hr className="separator" />

                            <button onClick={() => setOpenPopup(true)} className="primary-btn in-dark w-button mx-16">Approve</button>
                        </div>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};
