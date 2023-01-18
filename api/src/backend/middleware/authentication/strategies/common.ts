// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';

export const ensureParams = (
   record: Record<string, any>,
   next: CallableFunction,
   params: string[]
) => {
   try {
       for (let name of params) {
           if (!(record[name] && String(record[name]).trim())) {
               throw new Error(`Missing ${name} param.`);
           }
       }
   } catch (e) {
       next(e);
   }
}

export const cookieExtractor = function(req: any) {
    let token: any | null = null;
    if (req && req.cookies) token = req.cookies['access_token'];
    return token;
};

export const jwtOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'mysecretword'
};