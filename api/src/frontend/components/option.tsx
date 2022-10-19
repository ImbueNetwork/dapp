import React from "react";

export type OptionProps = {
  label: string;
  value: string;
  checked?: boolean;
  children?: React.ReactNode;
  onSelect: () => void;
};

export class Option extends React.Component<OptionProps> {
  render() {
    return (
      <div className="option-container" onClick={this.props.onSelect}>
        <div className="option-inner">
          <input
            type="radio"
            value={this.props.value}
            checked={this.props.checked}
            onChange={(e) => {
              e.target.checked && this.props.onSelect();
            }}
          />
          <p className="field-name">{this.props.label}</p>
        </div>
        <div className="option-children-container">{this.props.children}</div>
      </div>
    );
  }
}
