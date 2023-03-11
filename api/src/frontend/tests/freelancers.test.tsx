import { Freelancers } from "../pages/freelancer/new";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { Simulate } from "react-dom/test-utils";

test("test Freelancer rendering", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    const freelancerComponent = render(<Freelancers user={userInfo}/>);
    expect(freelancerComponent).toBeTruthy();
});


test("test Freelancer rendering and matching the snapshot", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    render(<Freelancers user={userInfo}/>);
    expect(screen.getByText('Get Started!')).toMatchSnapshot();
});

test("test freelancer onclick next snapshot matching", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    render(<Freelancers user={userInfo}/>);
    expect(screen.getByText('Get Started!')).toMatchSnapshot();
    fireEvent.click(screen.getByTestId('get-started-button'));
    expect(screen.getByText('A few quick questions: have you freelanced before?')).toMatchSnapshot();
});

test("test freelancer capturing the input textbox value", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    render(<Freelancers user={userInfo}/>);
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('title'), {target: {value: 'imbueLegends'}})
    expect(screen.getByTestId('title').value).toEqual('imbueLegends');
});

test("test freelancer capturing the multiselect languages", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    render(<Freelancers user={userInfo}/>);
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('tag-input'), {target: {value: ['German','hkh']}})
    expect(screen.getByTestId('tag-input').value).toEqual('German,hkh');
});


test("test freelancer the bio length ", () => {
    const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
    render(<Freelancers user={userInfo}/>);
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('bio'), {target: {value: "this is my bio" }})
    expect(screen.getByTestId('bio').value.length).toEqual(14);
});

// test("test freelancer submit method ", async () => {
//     const createProfile = jest.fn();
//     const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };
//     render(<Freelancers user={userInfo} />);
//     fireEvent.click(screen.getByTestId('get-started-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     fireEvent.click(screen.getByTestId('next-button'));
//     const submitEvent =  screen.getByTestId('submit-button')
//     fireEvent.click(submitEvent);
//     expect(createProfile).toHaveBeenCalledTimes(1);
//
// });


