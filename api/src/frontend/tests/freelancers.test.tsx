import { Freelancers } from "../pages/freelancer/new";
import { User } from "../models";

describe('freelancer', () => {
    it('test the freelancer component', () => {

        const userInfo: User = {"id":1,"username":"test","display_name":"test","password":"test","web3Accounts":[]};

        let freelancer: JSX.Element;
        const freelancerProps= {user: userInfo};
        freelancer = Freelancers(freelancerProps);
        expect(freelancer).toBeTruthy();
    });
});
