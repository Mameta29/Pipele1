import {
  Button, Loading, Note, Spacer, Tabs, Text, useToasts
} from '@geist-ui/core';
import { ethers } from 'ethers';
import LitJsSdk from 'lit-js-sdk';
import { useCallback, useEffect, useState } from 'react';
import './app.css';
import logo from './assets/logo/Pipele.png';
import { AccessControl } from './components/AccessControl';
import { Home } from './components/home';
import { MyContract } from './components/MyContract';
import { Read } from './components/Read';
import { Upload } from './components/Upload';
import { WriterContract } from './components/WriterContract';
import contractABI from './contracts/abi.json';
import contractAddress from './contracts/address.json';
import {
  getUserByDID, getUsers, registerUser, setUserDeployedContractAddress
} from './lib/threadDB';
import { connectCeramic } from './utils/ceramic';
import { connectThreadDB } from './utils/threadDB';
import { connectWallet, disconectWallet, web3Modal } from './utils/wallet';

const App = () => {
  const { setToast } = useToasts({ placement: 'bottomRight', padding: '1rem' });
  const handleMessage = (type, message) => {
    setToast({ type: type, text: message, delay: 6000 });
  };

  const [wallet, setWallet] = useState();
  const [walletConnected, setWalletConnected] = useState(false);
  const [ceramic, setCeramic] = useState();
  const [ceramicConnected, setCeramicConnected] = useState(false);
  const [threadDBConnected, setThreadDBConnected] = useState(false);
  const [user, setUser] = useState();
  const [users, setUsers] = useState();
  const [writer, setWriter] = useState();
  const [authSig, setAuthSig] = useState();
  const [litConnected, setLitConnected] = useState(false);
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    function init() {
      if (web3Modal.cachedProvider) {
        connect();
      }
    }
    init();
  }, [rerender]);

  const handleRerender = (value) => {
    setRerender(value);
  };

  const connect = useCallback(async () => {
    try {
      const { provider, injectedProvider, signer, address, balance, chainID } =
        await connectWallet();
      const wallet = {
        provider,
        injectedProvider,
        signer,
        address,
        balance,
        chainID,
      };
      setWallet(wallet);
      setWalletConnected(true);

      if (wallet.chainID !== 80001) return;

      const { ceramicClient, did, store, basicProfile } = await connectCeramic(
        provider,
        address
      );
      const ceramic = {
        client: ceramicClient,
        did,
        store,
        basicProfile,
      };
      setCeramic(ceramic);
      setCeramicConnected(true);

      await connectThreadDB(signer, address);
      setThreadDBConnected(true);

      const user = await getUserByDID(did);
      if (!user) {
        await registerUser(address, did);
        const user = await getUserByDID(did);
        setUser(user);
      }
      setUser(user);
      
      // writerコントラクトをインスタンス化する。
      const writer = new ethers.Contract(
        contractAddress.writer,
        contractABI.writer,
        signer
      );
      setWriter(writer);

      const userHasDeployed = await writer.getHasWriterDeployed(address);
      // デプロイ済みかをチェックする。
      if (userHasDeployed) {
        const deployedContractAddress =
          await writer.getWriterDeployedContractAddress(address);
        await setUserDeployedContractAddress(did, deployedContractAddress);
      }

      const users = await getUsers();
      setUsers(users);

      // Lit Protocol connection
      const client = new LitJsSdk.LitNodeClient({
        alertWhenUnauthorized: false,
      });
      await client.connect();
      window.litNodeClient = client;

      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'mumbai',
      });
      setAuthSig(authSig);
      setLitConnected(true);
    } catch (e) {
      console.log(e);

      if (
        e.message === 'Textile Auth Expired!' ||
        e.message === 'Bad API key signature'
      ) {
        handleMessage(
          'secondary',
          'Textile Auth expired! Reconnect your wallet.'
        );

        const { threadDBDisconnected, walletDisconnected } =
          await disconectWallet();
        if (threadDBDisconnected) setThreadDBConnected(false);
        setCeramicConnected(false);
        if (walletDisconnected) setWalletConnected(false);
      } else {
        console.log(e);

        handleMessage('error', e.message);
      }
    }
  }, []);

  return (
    <div className="wrapper">
      <div className="header">
        <div className="heading">
          <img className="logo" src={logo} width="130" alt="0xWriter logo" />
        </div>
        <div className="connect-buttons">
          {!walletConnected ? (
            <Button type="secondary" shadow scale={0.8} auto onClick={connect}>
              Connect Wallet
            </Button>
          ) : (
            <>
              <Button
                type="secondary"
                ghost
                scale={0.8}
                auto
                onClick={async () => {
                  const {
                    threadDBDisconnected,
                    litDisconnected,
                    walletDisconnected,
                  } = await disconectWallet();
                  if (threadDBDisconnected) setThreadDBConnected(false);
                  setCeramicConnected(false);
                  if (litDisconnected) setLitConnected(false);
                  if (walletDisconnected) setWalletConnected(false);
                }}
              >
                Disconnect Wallet
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="content">
        {!walletConnected ? (
          <>
            <Note label={false} type="default" marginTop="1rem">
              <Text b>Welcome to Pipele 👋</Text>
              <Text>Connect your wallet to get started!</Text>
            </Note>
            <Spacer />
            <Note>
              On initial few logins the data might not load or take longer than
              usual which is mostly because of ceramic stream not loading. If
              encountered such thing, disconnect and reconnect your wallet along
              with refreshing the app couple of times. THIS WILL BE FIXED SOON!
            </Note>
          </>
        ) : wallet.chainID !== 80001 ? (
          <Note
            width="fit-content"
            margin="auto"
            marginTop="1rem"
            label="Note "
          >
            Please connect to Mumbai Testnet.
          </Note>
        ) : !ceramicConnected ? (
          <Loading type="secondary" spaceRatio={2.5} marginTop="1rem">
            Connecting to ceramic network
          </Loading>
        ) : !threadDBConnected ? (
          <Loading type="secondary" spaceRatio={2.5} marginTop="1rem">
            Connecting to textile threadDB
          </Loading>
        ) : !litConnected ? (
          <Loading type="secondary" spaceRatio={2.5} marginTop="1rem">
            Connecting to lit protocol
          </Loading>
        ) : (
          <>
            <Tabs initialValue="1" hideDivider align="center">
              <Tabs.Item label="Home" value="1">
                <Spacer h={2} />
                <Home
                  wallet={wallet}
                  ceramic={ceramic}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
              <Tabs.Item label="My Contract" value="2">
                <Spacer h={2} />
                <MyContract
                  wallet={wallet}
                  ceramic={ceramic}
                  writer={writer}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
              <Tabs.Item label="Access Control" value="3">
                <Spacer h={2} />
                <AccessControl
                  wallet={wallet}
                  ceramic={ceramic}
                  writer={writer}
                  authSig={authSig}
                  user={user}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
              <Tabs.Item label="Upload" value="4">
                <Spacer h={1} />
                <Upload
                  wallet={wallet}
                  ceramic={ceramic}
                  writer={writer}
                  authSig={authSig}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
              <Tabs.Item label="Read" value="5">
                <Spacer h={2} />
                <Read
                  wallet={wallet}
                  ceramic={ceramic}
                  writer={writer}
                  authSig={authSig}
                  users={users}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
              <Tabs.Item label="Pipele Contract" value="6">
                <Spacer h={2} />
                <WriterContract
                  wallet={wallet}
                  ceramic={ceramic}
                  writer={writer}
                  handleRerender={handleRerender}
                  handleMessage={handleMessage}
                />
              </Tabs.Item>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

window.ethereum &&
  window.ethereum.on('chainChanged', (chainID) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1000);
  });

window.ethereum &&
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length === 0) {
      const credentials = JSON.parse(localStorage.getItem('payload'));

      if (credentials !== null) {
        localStorage.removeItem('payload');
      }

      await web3Modal.clearCachedProvider();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1000);
  });
