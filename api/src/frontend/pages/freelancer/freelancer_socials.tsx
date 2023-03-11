import React, { FunctionComponent, useState, useEffect } from 'react';
import { IconType } from 'react-icons/lib';
import { TextInput } from "../../components/textInput";

type FreelancerSocialProps = {
    label: string,
    key: string,
    icon: JSX.Element,
    link: string,
    isEdit: boolean
}

export const FreelancerSocial = (props: FreelancerSocialProps): JSX.Element => {
    const [getIsEdit, setIsEdit] = useState(false);
    const [getLink, setLink] = useState(props.link);

    useEffect(() => {
        setIsEdit(props.isEdit);
        setLink(props.link);
      }, [props.isEdit]);
    
    let media_icon: JSX.Element;
    if (props.link == "") {
        media_icon = <span>+</span>
    } else {
        media_icon = 
        <a href={props.link} target="_blank" rel="noopener"><span>{props.icon}</span></a>
    }

    if (getIsEdit) {
        return (
        
        <TextInput
                    value={getLink}
                    onChange={(e)=>{
                        setLink(e.target.value)
                    }}
                    className="bio-input"
                    title={props.label}
                    id={props.key + "-input"}
            />
        
        )
    } else {
        return (
            <div
                className="social-link"
                key={props.key}
            >
                <p>{props.label}</p>
                <button className="social-btn">
                        {media_icon}
                </button>
            </div>
        );
    }
};

export default alert;