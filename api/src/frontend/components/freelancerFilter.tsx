import React from "react";
import {
  type FreelancerFilterOption,
  type FilterOption,
} from "../types/freelancers";

interface FreelancerFilterProps {
  label: string;
  filter_options: FilterOption[];
  filter_type: FreelancerFilterOption;
}

export const FreelancerFilter = ({
  label,
  filter_options,
  filter_type,
}: FreelancerFilterProps): JSX.Element => {
  return (
    <div className="filter-section">
      <div className="filter-label">{label}</div>
      <div className="filter-option-list">
        {filter_options.map(({ value, interiorIndex }) => (
          <div className="filter-option" key={value}>
            <input
              type="checkbox"
              className="filtercheckbox"
              id={filter_type.toString() + "-" + interiorIndex}
            />
            <label className="capitalize">{value}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerFilter;
