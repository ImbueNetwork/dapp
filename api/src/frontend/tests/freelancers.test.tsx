import { Freelancers } from "../pages/freelancer/new";
import { User } from "../models";

describe('freelancer', () => {
    it('test the freelancer component', () => {

        const userInfo = { "id": 1, "username": "test", "display_name": "test", "password": "test", "web3Accounts": [] };

        const freelancer = Freelancers({user: userInfo});
        expect(freelancer).toBeTruthy();
    });
});
