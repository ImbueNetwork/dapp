import React from "react";

export type TextInputState = {
  remaining: number;
};

export interface TextInputProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export class TextInput extends React.Component<TextInputProps, TextInputState> {
  constructor(props: TextInputProps) {
    super(props);
    this.state = {
      remaining: props.maxLength ?? 0,
    };
  }
  handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.maxLength &&
      this.setState({
        ...this.state,
        remaining: this.props.maxLength - e.target.value.length,
      });
    this.props.onChange(e);
  };

  render() {
    return (
      <>
        <textarea {...this.props} onChange={this.handleChange} />
        {this.props.maxLength && (
          <p className="textarea-remaining">{`${
            this.state.remaining
          } character${this.state.remaining !== 1 ? "s" : ""} remaining`}</p>
        )}
      </>
    );
  }
}
