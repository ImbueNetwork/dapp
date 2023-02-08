import React from "react";
import { BriefFilterOption, FilterOption } from "../types/briefs";

type BriefFilterProps = {
    label: string;
    filter_options: Array<FilterOption>;
    filter_type: BriefFilterOption;
};

export const BriefFilter = ({ label, filter_options, filter_type }: BriefFilterProps): JSX.Element => {
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
                            <label>{value}</label>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default BriefFilter;
