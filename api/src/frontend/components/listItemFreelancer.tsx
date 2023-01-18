import * as React from 'react';

export type listItemFreelancerProps = {
    label: string
}

// This is a list item used in the freelancer form.
export class ListItemFreelancer extends React.Component<listItemFreelancerProps> {
    constructor(props: listItemFreelancerProps) {
        super(props);
    }

    render() {
        return (

                <div className='freelancer-li'>
                    <p>{this.props.label}</p>
                </div>

        );
    }
}

export default ListItemFreelancer;