import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import React from "react";
import { act } from "@testing-library/react";
import { Briefs } from "../pages/briefs";
import { getAllBriefs, callSearchBriefs } from "../services/briefsService";
import {
    amountOfBriefsSubmitted,
    briesData,
    intermidiateExpData,
    projectLengthData,
    searchMockResponse,
} from "./__mocks__/briefsData";

jest.mock("../services/briefsService", () => ({
    getAllBriefs: jest.fn(),
    callSearchBriefs: jest.fn(),
}));

describe("Briefs component", () => {
    beforeAll(() => {
        // Mock the briefsService.getAllBriefs method to return a fixed array of briefs
        const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
            typeof getAllBriefs
        >;
        mockGetAllBriefs.mockResolvedValue(briesData);
    });

    let briefsComponent;
    let appContainer;
    let appGetAllByText;
    let appQueryAllByTestId;

    beforeEach(async () => {
        briefsComponent = await act(async () => render(<Briefs />));
        const { container, queryAllByTestId, getAllByText } = await act(
            async () => render(<Briefs />)
        );
        appContainer = container;
        appGetAllByText = getAllByText;
        appQueryAllByTestId = queryAllByTestId;

        await waitFor(() =>
            expect(
                appContainer.getElementsByClassName("brief-title")
            ).toHaveLength(3)
        );
    });

    it("should render brief items when the component mounts.", async () => {
        expect(briefsComponent).toBeTruthy();
    });

    it("should render briefs list and filter options", async () => {
        // Check that filter options are displayed
        await waitFor(() =>
            expect(
                appContainer.getElementsByClassName("filter-option")
            ).toBeTruthy()
        );
    });

    it("should filter briefs by experience level", async () => {
        const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
            typeof callSearchBriefs
        >;

        // get intermidiate checkbox
        const Intermediatecheckbox = await waitFor(
            () => appQueryAllByTestId("0-1")[0]
        );

        expect(Intermediatecheckbox).toBeTruthy();

        if (appContainer) {
            fireEvent.click(Intermediatecheckbox);

            mockCallSearchBriefs.mockResolvedValue(intermidiateExpData);
            // search for intermidiate briefs
            await waitFor(() =>
                fireEvent.click(
                    appContainer.getElementsByClassName("tab-item")[0]
                )
            );

            await waitFor(() =>
                expect(
                    appContainer.getElementsByClassName("brief-title")
                ).toHaveLength(1)
            );
        }
    });

    it("should filter briefs by amount of Briefs submitted", async () => {
        const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
            typeof callSearchBriefs
        >;

        const AmountSubmittedcheckbox = await waitFor(
            () => appQueryAllByTestId("1-1")[0]
        );

        expect(AmountSubmittedcheckbox).toBeTruthy();

        if (appContainer) {
            fireEvent.click(AmountSubmittedcheckbox);
            mockCallSearchBriefs.mockResolvedValue(amountOfBriefsSubmitted);
            // search for intermidiate briefs
            await waitFor(() =>
                fireEvent.click(
                    appContainer.getElementsByClassName("tab-item")[0]
                )
            );
            await waitFor(() =>
                expect(
                    appContainer.getElementsByClassName("brief-title")
                ).toHaveLength(2)
            );
        }
    });

    it("should filter briefs by project length", async () => {
        const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
            typeof callSearchBriefs
        >;

        const ProjectLengthcheckbox = await waitFor(
            () => appQueryAllByTestId("2-0")[0]
        );

        expect(ProjectLengthcheckbox).toBeTruthy();

        if (appContainer) {
            fireEvent.click(ProjectLengthcheckbox);

            mockCallSearchBriefs.mockResolvedValue(projectLengthData);
            // search for intermidiate briefs
            await waitFor(() =>
                fireEvent.click(
                    appContainer.getElementsByClassName("tab-item")[0]
                )
            );

            await waitFor(() =>
                expect(
                    appContainer.getElementsByClassName("brief-title")
                ).toHaveLength(1)
            );
        }
    });

    test("test brief rendering and matching the snapshot", async () => {
        expect(screen.queryAllByText("briefs found")[0]).toMatchSnapshot();
    });

    test("onSearch should filter briefs based on search input and selected checkboxes", async () => {
        // Mock the elements and values needed for the test
        const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
            typeof callSearchBriefs
        >;

        const ExperienceCheckBox = await waitFor(
            () => appQueryAllByTestId("0-1")[0]
        );
        const SubmitedCheckBox = await waitFor(
            () => appQueryAllByTestId("1-2")[0]
        );

        const searchInput =
            appContainer.getElementsByClassName("search-input")[0];

        expect(ExperienceCheckBox).toBeTruthy();
        expect(SubmitedCheckBox).toBeTruthy();
        expect(searchInput).toBeTruthy();

        if (appContainer) {
            // fire checkboxes event
            fireEvent.click(ExperienceCheckBox);
            fireEvent.click(SubmitedCheckBox);

            // input search text
            fireEvent.change(searchInput, {
                target: { value: "briefThree" },
            });

            mockCallSearchBriefs.mockResolvedValue(searchMockResponse);
            // search for input brief
            await waitFor(() =>
                fireEvent.click(
                    appContainer.getElementsByClassName("tab-item")[0]
                )
            );

            await waitFor(() =>
                expect(appGetAllByText("briefThree")[0]).toBeTruthy()
            );
        }
    });
});