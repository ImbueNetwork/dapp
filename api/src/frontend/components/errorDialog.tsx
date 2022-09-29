import * as React from 'react';
import { ReactElement } from "react";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
import { Button } from "@rmwc/button";


export type ErrorDialogProps = {
    errorMessage: String | null,
    showDialog: boolean,
    closeDialog: () => void
}

export class ErrorDialog extends React.Component<ErrorDialogProps> {
    constructor(props: ErrorDialogProps) {
        super(props);
    }

    render() {
        return (
            <Dialog
                open={this.props.showDialog}
                onClose={(evt) => {
                    this.props.closeDialog();
                }}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>{this.props.errorMessage}</DialogContent>
                <DialogActions>
                    <DialogButton action="accept" isDefaultAction>
                        Ok
                    </DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}