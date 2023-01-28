import React from "react";
import { BriefFilterOption, FilterOption } from "../types/briefs";

type BriefFilterProps = {
    label: string;
    filter_options: Array<FilterOption>;
    filter_type: BriefFilterOption;
};

export class BriefFilter extends React.Component<BriefFilterProps> {
    render() {
        return (
            <div className="filter-section">
                <div className="filter-label">{this.props.label}</div>
                <div className="filter-option-list">
                    {this.props.filter_options.map(
                        ({ value, interiorIndex }) => (
                            <div className="filter-option" key={value}>
                                <input
                                    type="checkbox"
                                    className="filtercheckbox"
                                    id={
                                        this.props.filter_type.toString() +
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
}

export default BriefFilter;
