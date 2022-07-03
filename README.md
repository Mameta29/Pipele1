## Project Name

Pipele

## About Project

We have developed a system that allows for true private space and secure data sharing through the use of LitProtocol. An NFT is issued by taking an action on the person with whom you want to share data, and the data can be accessed using that NFT.

## The problem it is Soving

The data on the blockchain is publicly available and can be checked by anyone in the world. However, being open to the public means that there is no room for the creation of personal private spaces. Also, while private spaces can be created in DropBox and other places, the data is managed in different parts of the world and is not truly private.

## Technologies used

What is Lit Protocol?
Lit Protocol encrypts data (photos, videos, etc.). After encryption, the condition can be set with on-chain data.

・ Ownership of specific NFTs.

・ Ownership of a certain number of ETH.

・ Smart contract results, etc.

For example, if a condition for ownership of a particular NFT is set and met, the owner of the NFT will be given the encryption key. This key is used to decrypt encrypted data and access private space.

## Installation

Clone this project to test locally

```bash
  git clone https://github.com/devpavan04/0xWriter.git
  cd 0xWriter
  npm install
```

Also install client and middleware dependencies

```bash
  cd middleware
  npm install
  cd ..
  cd client
  npm install
  cd ..
```

## Environment Variables

Add the following in the .env file inside `middleware` folder :

`USER_GROUP_KEY`

`USER_GROUP_SECRET`

You can get the above keys by going through [Textile Docs](https://docs.textile.io/hub/apis/#user-group-key)

Add the following in the .env file inside `client` folder :

`REACT_APP_ALCKEMY_API_KEY`

`REACT_APP_SERVER_URL` - http://localhost:3001

`REACT_APP_CERAMIC_URL` - http://localhost:7007

## Run Locally

Start ceramic daemon

```bash
  npm install -g @ceramicnetwork/cli
  ceramic daemon
```

Run middleware

```bash
  cd middleware
  npm start
```

Start client

```bash
  cd client
  npm start
```

Go to http://localhost:3000 on your browser to interact with the dapp.

## Technologies used

- [Ceramic DID DataStore](https://developers.ceramic.network/tools/glaze/did-datastore/)

- [Textile ThreadDB](https://docs.textile.io/threads/)

- [Lit Protocol](https://litprotocol.com/)

Read more on how the above technologies are used in the app [here](https://glory-barber-0dd.notion.site/0xWriter-Tech-Stack-e2e79965a4524147ac6dc079b82e3ac8)

## Built With

- [Create React App](https://create-react-app.dev/)

- [Express JS](https://expressjs.com/)

- [Geist UI](https://geist-ui.dev/en-us)

- [Remix Icons](https://remixicon.com/)

## Author

[@pavansoratur](https://github.com/devpavan04)
