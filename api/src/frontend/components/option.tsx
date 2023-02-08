import React from "react";

export type OptionProps = {
  label: string;
  value: string | number;
  checked?: boolean;
  children?: React.ReactNode;
  onSelect: () => void;
};

export const Option = ({ label, value, checked, children, onSelect }: OptionProps): JSX.Element => {
  return (
    <div className="option-container" onClick={onSelect}>
      <div className="option-inner">
        <input
          type="radio"
          value={value}
          checked={checked}
          onChange={(e) => {
            e.target.checked && onSelect();
          }}
        />
        <p className="field-name">{label}</p>
      </div>
      <div className="option-children-container">{children}</div>
    </div>
  );
}
