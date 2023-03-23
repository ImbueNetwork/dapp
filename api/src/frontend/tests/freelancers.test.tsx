import { Freelancers } from "../pages/freelancer/new";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

function setUp() {
    const user = {
        "id": 1,
        "username": "test",
        "display_name": "test",
        "password": "test",
        "web3_address": "test",
        "web3Accounts": [],
        "getstream_token": "test",
    };
    render(<Freelancers user={user} />);
}

test("test Freelancer rendering", () => {
    expect(render(<Freelancers user={{
        "id": 1,
        "username": "test",
        "display_name": "test",
        "password": "test",
        "web3_address": "test",
        "web3Accounts": [],
        "getstream_token": "test",
    }} />)).toBeTruthy();
});

test("test Freelancer rendering and matching the snapshot", () => {
    setUp();
    expect(screen.getByText('Get Started!')).toMatchSnapshot();
});

test("test freelancer onclick next snapshot matching", () => {
    setUp();
    expect(screen.getByText('Get Started!')).toMatchSnapshot();
    fireEvent.click(screen.getByTestId('get-started-button'));
    expect(screen.getByText('A few quick questions: have you freelanced before?')).toMatchSnapshot();
});

test("test freelancer validation failure not proceeding the next step", () => {
    setUp();
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    // so here after clicking the next-button the snapshot is still matching with the previous page
    expect(screen.getByText('A few quick questions: have you freelanced before?')).toMatchSnapshot();
});

test("test freelancer validation passing if the value is being entered ", () => {
    setUp();
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('freelance-xp-1'));
    fireEvent.click(screen.getByTestId('next-button'));
    expect(screen.getByText('Great, so what’s your biggest goal for freelancing?')).toMatchSnapshot();
});

test("test freelancer capturing the input textbox value", () => {
    setUp();
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('freelance-xp-1'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('freelance-goal-2'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('title'), {target: {value: 'imbueLegends'}})
    expect((screen.getByTestId('title') as HTMLInputElement).value).toEqual('imbueLegends');
});

test("test freelancer capturing the multiselect languages", () => {
    setUp();
    fireEvent.click(screen.getByTestId('get-started-button'));
    fireEvent.click(screen.getByTestId('freelance-xp-1'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('freelance-goal-2'));
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('title'), {target: {value: 'imbueLegends'}})
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('tag-input'), {target: {value: ['German','French']}})
    expect((screen.getByTestId('tag-input') as HTMLInputElement).value).toEqual('German,French');
});
