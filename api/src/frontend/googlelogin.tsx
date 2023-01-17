import React, { FunctionComponent, useState } from 'react'
import ReactDOMClient from "react-dom/client";
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

interface GoogleSignInComponentProps {
  loginSuccess: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
}

export const GoogleSignInComponent: FunctionComponent<GoogleSignInComponentProps> = ({ loginSuccess }) => {

  const [loginFailed, setLoginFailed] = useState<boolean>();

  return (
    
    <div className="text-center mb-4">
      <h1 className="h3 mb-3 font-weight-normal">Welcome to Library Portal</h1>
      <p>Sign In</p>
      <GoogleLogin
        clientId='291328461849-mh0b5k7hict41lvgrodj499sivc1m3qo.apps.googleusercontent.com'
        buttonText='Google'
        onSuccess={loginSuccess}
        onFailure={(response: any) => {
          setLoginFailed(true);
        }}
        cookiePolicy={'single_host_origin'}
        responseType='code,token'
      />
    </div>
      
  )
};

document.addEventListener("DOMContentLoaded", (event) => {
  ReactDOMClient.createRoot(document.getElementById("googlelogin")!).render(
    <GoogleSignInComponent loginSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {}} />
  );
});