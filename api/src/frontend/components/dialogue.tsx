import * as React from 'react';
import {ReactElement} from "react";

export type DialogueProps = {
    title: String,
    content?: ReactElement
    actionList: ReactElement
}

export class Dialogue extends React.Component<DialogueProps> {
    constructor(props: DialogueProps) {
        super(props);
    }

    render() {
        return (
            <div className="mdc-dialog mdc-dialog--open" id="dialog">
                <div className="mdc-dialog__container">
                    <div className="mdc-dialog__surface" role="alertdialog" aria-modal="true"
                         aria-labelledby="dialog-title" aria-describedby="dialog-content"><h2
                        className="mdc-dialog__title" id="dialog-title">{this.props.title}</h2>
                        <div className="mdc-dialog__content" id="dialog-content">
                            {this.props?.content}
                            <ul className="mdc-deprecated-list mdc-deprecated-list--avatar-list">
                                {this.props.actionList}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mdc-dialog__scrim"></div>
            </div>
        );
    }
}