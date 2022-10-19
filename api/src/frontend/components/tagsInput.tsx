import React, { KeyboardEvent } from "react";

export type TagsInputProps = {
  tags: string[];
  suggestData: string[];
  onChange: (tags: string[]) => void;
};

export type TagsInputState = {
  tags: string[];
  input: string;
};

export class TagsInput extends React.Component<TagsInputProps, TagsInputState> {
  constructor(props: TagsInputProps) {
    super(props);
    this.state = {
      tags: props.tags,
      input: "",
    };
  }

  handleDelete = (targetIndex: number) => {
    this.setState(
      {
        ...this.state,
        tags: this.state.tags.filter((tag, index) => index !== targetIndex),
      },
      () => this.props.onChange(this.state.tags)
    );
  };

  handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
    if (["Tab", "Enter"].includes(e.key) && this.state.input) {
      this.setState(
        {
          input: "",
          tags: [...this.state.tags, this.state.input],
        },
        () => this.props.onChange(this.state.tags)
      );
    }
  };

  addItem = (item: string) => {
    this.setState(
      {
        ...this.state,
        tags: [...this.state.tags, item],
      },
      () => this.props.onChange(this.state.tags)
    );
  };

  render() {
    return (
      <>
        <div className="selected-tags">
          {this.props.tags.map((tag, i) => (
            <div key={i} className="selected-tag-item">
              {tag}
              <div
                className="unselect-tag"
                onClick={() => this.handleDelete(i)}
              >
                x
              </div>
            </div>
          ))}
          <input
            type="text"
            className="new-tag-input"
            value={this.state.input}
            onChange={(e) =>
              this.setState({ ...this.state, input: e.target.value })
            }
            onKeyDown={this.handleKeyDown}
          />
        </div>
        <div className="tags-suggestion-container">
          {this.props.suggestData
            .filter((item: string) => this.state.tags.indexOf(item) === -1)
            .map((item, index) => (
              <div className="tag-suggestion" key={index}>
                <span className="tag-suggestion-text">{item}</span>
                <span
                  className="tag-suggest-button"
                  onClick={() => this.addItem(item)}
                >
                  +
                </span>
              </div>
            ))}
        </div>
      </>
    );
  }
}
