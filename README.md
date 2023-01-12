# Google authentication + ERC-4337 demo

This is a rudimentary demo of using social logins to create ERC-4337 addresses.

Use at your own risk. This was created for educational purposes only and is not fit for a production environment.

There are two directories: a client and a server. The client contains a react front end that lets user authenticate with google and generates an ERC-4337 address. The server stores user email addresses and ERC-4337 contract addresses.

The server and client must be started separately.



## Start the server
```
cd server
npm install
npm start dev
```

## Start the client
First, navigate to the client directory.
```
cd client
```

Then change the `src/config.json` file to include the location of an ERC-4337 bundler and node RPC. You can get an ERC-4337 bundler for free at https://app.stackup.sh/.

You may also need to change the `data-client_id` in the `g_id_onload` div in `App.tsx`. You can get one from Google.

```
npm install
npm run start
```
