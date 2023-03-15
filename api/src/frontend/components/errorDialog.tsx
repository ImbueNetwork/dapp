import * as React from 'react';
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";

export type ErrorDialogProps = {
    errorMessage: String | null,
    showDialog: boolean,
    closeDialog: () => void
}

export const ErrorDialog = ({ errorMessage, showDialog, closeDialog }: ErrorDialogProps): JSX.Element => {
    return (
        <Dialog
            open={showDialog}
            onClose={(evt) => {
                closeDialog();
            }}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>{errorMessage}</DialogContent>
            <DialogActions>
                <DialogButton action="accept" isDefaultAction>
                    Ok
                </DialogButton>
            </DialogActions>
        </Dialog>
    );
}