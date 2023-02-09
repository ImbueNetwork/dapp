import React, { FunctionComponent } from 'react';
import alertType from './alertType';

type AlertProps = {
    type: alertType,
    message: string
}

const Alert = ({ type, message }: AlertProps): JSX.Element => {
    let alertClassName = 'alert alert-dismissible fade show ';
    let title = '';

    if (type === alertType.SUCCESS) {
        alertClassName += 'alert-success';
        title = 'Success!';
    } else if (type === alertType.WARNING) {
        alertClassName += 'alert-warning';
        title = 'Warning!';
    } else if (type === alertType.ERROR) {
        alertClassName += 'alert-danger';
        title = 'Error!';
    }

    return (
        <div className={alertClassName} role="alert">
            <strong>{title}</strong> {message}
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};

export default alert;