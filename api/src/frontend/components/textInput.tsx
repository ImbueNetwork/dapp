import React, { useState } from "react";

export interface TextInputProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextInput = (props: TextInputProps): JSX.Element => {
  const [remaining, setRemaining] = useState(props.maxLength ?? 0);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.maxLength && setRemaining(props.maxLength - e.target.value.length);
    props.onChange(e);
  };

  return (
    <>
      <textarea {...props} onChange={handleChange} />
      {props.maxLength && (
        <p className="textarea-remaining">{`${remaining} character${remaining !== 1 ? "s" : ""} remaining`}</p>
      )}
    </>
  );
}
