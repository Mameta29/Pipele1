import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../../contracts/abi.json';
import {
  getUserByAddress,
  addSubscriber,
  removeSubscriber,
} from '../../lib/threadDB';
import './style.css';
import {
  Button,
  Spacer,
  Spinner,
  Note,
  Tag,
  Description,
  Input,
  Link,
} from '@geist-ui/core';

export const MyContract = ({
  wallet,
  ceramic,
  writer,
  handleRerender,
  handleMessage,
}) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [initialMint, setInitialMinit] = useState('');
  const [deploymentFee, setDeploymentFee] = useState('');
  const [userHasDeployed, setUserHasDeployed] = useState(false);
  const [writerERC20, setWriterERC20] = useState();
  const [userDeployedContractAddress, setUserDeployedContractAddress] =
    useState('');
  const [userTokenName, setUserTokenName] = useState('');
  const [userTokenSymbol, setUserTokenSymbol] = useState('');
  const [userTokenPrice, setUserTokenPrice] = useState('');
  const [userTokenTotalMinted, setUserTokenTotalMinted] = useState('');
  const [userTokenContractBalance, setUserTokenContractBalance] = useState('');
  const [userTokenBalance, setUserTokenBalance] = useState('');
  const [newMint, setNewMint] = useState();
  const [transferAddress, setTransferAddress] = useState();
  const [transferAmount, setTransferAmount] = useState();
  const [newTokenPrice, setNewTokenPrice] = useState();
  const [deployBtnLoading, setDeployBtnLoading] = useState(false);
  const [mintBtnLoading, setMintBtnLoading] = useState(false);
  const [transferBtnLoading, setTransferBtnLoading] = useState(false);
  const [changePriceBtnLoading, setChangePriceBtnLoading] = useState(false);
  const [withdrawBtnLoading, setWithdrawBtnLoading] = useState(false);

  // 
  const deployMintNFTcontract = async () => {
    try {
        const txn = await writer.deployWMintNFTContract(
          ceramic.did,
          tokenName,
          tokenSymbol,
          ethers.utils.parseEther(tokenPrice),
          Number(initialMint),
          { value: deploymentFee }
        );

        const receipt = await txn.wait();

        if (receipt.status === 1) {
          setDeployBtnLoading(false);
          handleMessage('success', 'Transaction successful!');
        } else {
          setDeployBtnLoading(false);
          handleMessage('error', 'Transaction failed!');
        }
        handleRerender(true);
      }
    } catch (e) {
      console.log(e);

      setDeployBtnLoading(false);
      handleMessage('error', e.message);
    }
  };

  const mintNewTokens = async () => {
    try {
      if (!newMint) {
        handleMessage('warning', 'Please enter no. of tokens.');
      } else if (Number(newMint) <= 0) {
        handleMessage('warning', 'No. of tokens should be atleast 1.');
      } else {
        setMintBtnLoading(true);

        let mintPrice = await writerERC20.getTokenPrice();
        mintPrice = String(mintPrice * newMint);

        const txn = await writerERC20.mint(Number(newMint), {
          value: mintPrice,
        });

        const receipt = await txn.wait();

        if (receipt.status === 1) {
          handleMessage('success', 'Transaction successful!');
          handleMessage('success', 'Updating user on threadDB...');
        } else {
          setMintBtnLoading(false);
          handleMessage('error', 'Transaction failed!');
        }

        const loggedInUserBalanceOfWriterToken = await writerERC20.balanceOf(
          wallet.address
        );
        const writerData = await ceramic.store.get('writerData', ceramic.did);
        if (writerData !== undefined && writerData !== null) {
          if (writerData.accessControlConditions[0] !== null) {
            const writerRequiredNoOfTokensToAccess =
              writerData.accessControlConditions[0][0].returnValueTest.value;
            if (
              Number(loggedInUserBalanceOfWriterToken) >=
              Number(writerRequiredNoOfTokensToAccess)
            ) {
              await addSubscriber(ceramic.did, ceramic.did);
            } else {
              await removeSubscriber(ceramic.did, ceramic.did);
            }
          }
        }

        handleMessage('success', 'User updated on threadDB!');
        setMintBtnLoading(false);

        setNewMint('');

        handleRerender(true);
      }
    } catch (e) {
      console.log(e);

      setMintBtnLoading(false);
      handleMessage('error', e.message);
    }
  };


  useEffect(() => {
    async function init() {
      if (writer !== undefined) {
        const deploymentFee = await writer.getDeploymentFee();
        setDeploymentFee(deploymentFee);

        const userHasDeployed = await writer.getHasWriterDeployed(
          wallet.address
        );
        if (userHasDeployed) {
          setUserHasDeployed(true);

          const deployedContractAddress =
            await writer.getWriterDeployedContractAddress(wallet.address);
          setUserDeployedContractAddress(deployedContractAddress);

          const mintNFT = new ethers.Contract(
            deployedContractAddress,
            contractABI.mintNFT,
            wallet.signer
          );
          setMintNFT(mintNFT);

        
        }
      }
    }
    init();
  }, []);

  return (
    <div className="contract-content">
      {userHasDeployed ? (
        <div className="user-contract-content">
          <h2> You have already depolyed your NFT </h2>
          
      ) : (
        <>
          <Note width="fit-content" label="Note ">
            To start writing your blog, you must first deploy an ERC20 contract
            (WriterERC20) to create a token gated access to your blog.
          </Note>
          <Spacer h={3} />
          <Description
            title="Deployment Fee"
            content={
              !deploymentFee ? (
                <Spinner />
              ) : (
                <Tag type="lite">
                  {ethers.utils.formatEther(deploymentFee) + ' MATIC'}
                </Tag>
              )
            }
          />
          <Spacer h={2} />
            {deployBtnLoading ? (
              <Button
                type="secondary"
                shadow
                loading
                scale={0.8}
                className="btn"
                onClick={deployWriterERC20Contract}
              >
                Deploy Contract
              </Button>
            ) : (
              <Button
                type="secondary"
                shadow
                scale={0.8}
                className="btn"
                onClick={deployWriterERC20Contract}
              >
                Deploy Contract
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
