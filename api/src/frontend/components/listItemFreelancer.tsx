import * as React from 'react';

export type listItemFreelancerProps = {
    content: string
}

// This is a list item used in the freelancer form.
export class ListItemFreelancer extends React.Component<listItemFreelancerProps> {
    constructor(props: listItemFreelancerProps) {
        super(props);
    }

    render() {
        return (
            <li>
                <div className='freelancer-li'>
                    <p>{this.props.content}</p>
                </div>
            </li>
        );
    }
}

export default ListItemFreelancer;