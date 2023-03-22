
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { NewBrief } from "../pages/briefs/new";


test("test  NewBrief rendering", () => {
    const briefComponent = render(<NewBrief />);
    expect(briefComponent).toBeTruthy();
});

test("test NewBrief rendering and matching the snapshot", () => {
    render(<NewBrief />);
    expect(screen.getByText('Write a headline for your brief')).toMatchSnapshot();
});

test("test brief onclick next snapshot is matching", () => {
    render(<NewBrief />);
    expect(screen.getByText('Examples')).toMatchSnapshot();
    fireEvent.change(screen.getByTestId('headline-input'), {target: {value: 'briefHeadline'}})
    expect((screen.getByTestId('headline-input') as HTMLInputElement).value).toEqual('briefHeadline');
});

test("test validate method working in the new-brief component", async () => {
    render(<NewBrief />);
    fireEvent.click(screen.getByTestId('next-button'));

    // here upon clicking next button, still the snapshot is matching with the previous page
    expect(screen.getByText('Examples')).toMatchSnapshot();
});


test("test brief validate and onclick works when validation satisfies", async () => {
    render(<NewBrief />);
    fireEvent.change(screen.getByTestId('headline-input'), {target: {value: 'briefHeadline'}})
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.change(screen.getByTestId('tag-input'), {target: {value: ['Web3','Defi']}})
    expect((screen.getByTestId('tag-input') as HTMLInputElement).value).toEqual('Web3,Defi');
});