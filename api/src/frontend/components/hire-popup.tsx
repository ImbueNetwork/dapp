import React, { ReactElement, useEffect, useState } from 'react';
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import "../../../public/application-preview.css";
import { getWeb3Accounts, initImbueAPIInfo } from '../utils/polkadot';
import { Brief, Currency, Freelancer, Project, ProjectStatus, User } from "../models";
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { blake2AsHex } from '@polkadot/util-crypto';
import { selectAccount } from '../services/polkadotService';
import ChainService from '../services/chainService';
import { BasicTxResponse } from '../models';
import { getCurrentUser } from '../utils';

export const HirePopup = ({ openPopup, setOpenPopup, freelancer, application, milestones, totalCostWithoutFee, imbueFee, totalCost }) => {
    const [popupStage, setstage] = useState<number>(0)
    const [walletOptions, setWalletOptions] = useState<number[]>([0, 1, 2])
    const [accounts, setAccounts] = React.useState<InjectedAccountWithMeta[]>([]);

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

    const fetchAndSetAccounts = async () => {
        const accounts = await getWeb3Accounts();
        setAccounts(accounts);
    };

    const selectedAccount = async (account: InjectedAccountWithMeta) => {
        const imbueApi = await initImbueAPIInfo();
        const user: User = await getCurrentUser();
        const chainService = new ChainService(imbueApi, user);

        const briefOwners: string[] = [user.web3_address];
        const freelancerAddress: string = freelancer.web3_address;
        const budget: bigint = BigInt(totalCost * 1e12);
        const initialContribution: bigint = BigInt(totalCost * 1e12);
        const briefId=blake2AsHex(JSON.stringify(application));
        const currencyId = application.currency_id;

        const milestones = application.milestones.map((m, idx) => ({
            percentageToUnlock: parseInt(m.percentage_to_unlock)
        }));

        const result = await chainService?.hireFreelancer(account, briefOwners,freelancerAddress,budget,initialContribution,briefId, currencyId, milestones);
        while (true) {
            if (result.status || result.txError) {
                if (result.status) {
                    console.log("***** success");
                } else if (result.txError) {
                    console.log("***** failed");
                    console.log(result.errorMessage);
                }
                break;
            }
            await new Promise(f => setTimeout(f, 1000));
        }

        setstage(3)
    }

    useEffect(() => {
        void fetchAndSetAccounts();
    }, []);

    const FirstContent = () => {
        return (
            <div className="relative modal-container">
                <div className="flex w-full justify-start items-center gap-11 px-16 pb-2">
                    <img className="w-16 h-16 rounded-full object-cover" src='/public/profile-image.png' alt="" />
                    <span className="text-xl font-bold">{freelancer?.display_name}</span>
                </div>
                <h3 className="absolute top-0 text-center w-full text-xl font-bold primary-text">Hire This Freelancer</h3>
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

                <button onClick={() => setstage(1)} className="primary-btn in-dark w-button mx-16">Approve</button>
            </div>
        )
    }

    const SecondContent = () => {
        return (
            <div className="flex flex-col justify-center items-center modal-container">
                <h3 className="text-center w-full text-xl font-bold my-4 primary-text">Hire This Freelancer</h3>
                {
                    accounts.map((account, index) => (
                        <div key={index} onClick={()=> selectedAccount(account)} className='w-2/3 h-14 grey-container mb-3 flex justify-center items-center cursor-pointer'>
                            <p className='text-center'>{account.address}</p>
                        </div>
                    ))

                }
                {/* <button onClick={() => setstage(2) } className="primary-btn in-dark w-button w-1/3 mx-16" style={{ textAlign: "center" }} >Connect Wallet</button> */}
            </div>
        )
    }

    const ThirdContent = () => {
        return (
            <div className="flex flex-col justify-center items-center modal-container w-2/3 mx-auto">
                <h3 className="text-center w-full text-xl font-bold my-4 primary-text">Deposit Fuds</h3>
                <p className="text-center w-full text-xl font-bold my-4">Deposit the funds required for the project, these funds will be taken from your account once the freelancer starts the project.</p>
                <p className="text-center w-full text-xl font-bold my-4">The  funds are then paid to the freelancer iin stages only when you approve the completion of each milestone</p>
                <h3 className='mb-10'><span className='primary-text mr-1'>24000</span>$IIMBUE</h3>
                <button onClick={() => { setstage(0);setOpenPopup(false) }} className="primary-btn in-dark w-button w-1/3 mx-16" style={{ textAlign: "center" }} >Deposit Funds</button>
            </div>
        )
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openPopup}
            onClose={() => { setOpenPopup(false); setstage(0) }}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}>
            <Fade in={openPopup}>
                <Box sx={modalStyle}>
                    {
                        (!popupStage && openPopup) && <SecondContent />
                    }
                    {
                        popupStage === 1 && <SecondContent />
                    }
                    {
                        popupStage === 2 && <ThirdContent />
                    }
                </Box>
            </Fade>
        </Modal>

    );
};
