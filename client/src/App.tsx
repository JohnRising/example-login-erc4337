import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import jwt_decode from "jwt-decode";
import { getSimpleAccount } from "./getSimpleAccount";
const config = require("./config.json");

declare global {
  interface Window {
    handleCredentialResponse?: any;
  }
}

function App() {
  // Set state variables and their interfaces.
  // The data will have a type User, which contains the email and smart contract address.
  interface User {
    email: string;
    address: string;
  }
  const emptyUser: User = { email: "", address: "" };
  const [user, setUser] = useState({} as User);
  const [backendData, setBackendData] = useState({} as User);
  // This function determines if a user is logged out. If you change the User interface,
  // you may need a different way to check if a user is logged out.
  function isLoggedOut(user: User) {
    return (
      JSON.stringify(user) == JSON.stringify(emptyUser) ||
      Object.keys(user).length == 0
    );
  }

  // LOGIN
  // When a user authenticates using the google widget, grab the data and put it in userObject.
  window.handleCredentialResponse = (response: any) => {
    var userObject = jwt_decode(response.credential as any);
    setUser(userObject as any);
    (document.getElementById("g_id_signin") as HTMLElement).hidden =
      isLoggedOut(user) ? true : false;
  };

  // LOGOUT
  // When a user clicks log out, clear the user state and show the login button again
  function handleSignOut(event: any) {
    setUser(emptyUser);
    setBackendData(emptyUser);
    (document.getElementById("g_id_signin") as HTMLElement).hidden = false;
  }

  // Get a counterfactual address using the account API.
  async function getAddress(potentialWallet: ethers.Wallet) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const accountAPI = getSimpleAccount(
      provider,
      potentialWallet.privateKey,
      config.entryPoint,
      config.simpleAccountFactory
    );
    const address = await accountAPI.getCounterFactualAddress();
    return address;
  }

  // Send a request to the server to get the account information.
  // If the user doesn't have an account, the backend will need to create one for them.
  // The private key associated with ownership of the account needs to be generated client-side.
  // Rather than send two requests to the server - one which asks if an account exists and
  // another to create the account if it doesn't - we will create a new address and send it
  // in our request to the server. The server will add the proposed address, potentialAddress,
  // to the database if an account associated with the email address does not exist.
  async function postAccount() {
    if (!isLoggedOut(user)) {
      // TODO: store the private key somewhere for the user when an account is created!
      const potentialWallet = ethers.Wallet.createRandom();
      const potentialAddress = await getAddress(potentialWallet);

      const postData = {
        email: user.email,
        address: potentialAddress,
      };
      fetch("http://localhost:5000/return-account", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          setBackendData(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  useEffect(() => {
    postAccount();
  }, [user]);

  return (
    <div className="App">
      <header className="App-header">
        <div
          id="g_id_onload"
          data-client_id="247332257621-9rev3pq5eef71olb55jvu8b2gkbd5c1h.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleCredentialResponse"
          data-auto_prompt="false"
        ></div>

        <div
          id="g_id_signin"
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="continue_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>

        {!isLoggedOut(user) && (
          <>
            <button onClick={(e) => handleSignOut(e)}>Sign out</button>
            <p>Email: {backendData.email}</p>
            <p>Account Owner: {backendData.address}</p>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
