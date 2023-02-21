import React from "react";
import { FreelancerFilterOption, FilterOption } from "../types/freelancers";

type FreelancerFilterProps = {
    label: string;
    filter_options: Array<FilterOption>;
    filter_type: FreelancerFilterOption;
};

export const FreelancerFilter = ({ label, filter_options, filter_type }: FreelancerFilterProps): JSX.Element => {
    return (
        <div className="filter-section">
            <div className="filter-label">{label}</div>
            <div className="filter-option-list">
                {filter_options.map(
                    ({ value, interiorIndex }) => (
                        <div className="filter-option" key={value}>
                            <input
                                type="checkbox"
                                className="filtercheckbox"
                                id={
                                    filter_type.toString() +
                                    "-" +
                                    interiorIndex
                                }
                            />
                            <label className="capitalize">{value}</label>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default FreelancerFilter;
