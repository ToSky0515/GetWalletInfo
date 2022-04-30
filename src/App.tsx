import React, { useState } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import './App.scss';
import ERC20ABI from "../src/contracts/ERC20.json";

function App() {
  const [walletAddress, setWalletAddress] = useState('0x524155b7b5fE0e46695Eb377c2a0052043F60b98');
  const [tokenAddress, setTokenAddress] = useState('');

  const tokenAddresses = [
    '0x198FbE9304c2e02620001a7b0a9EAC04A6FCF24d',
    '0xb31654Aad76F8aC98e04Db0425285f2d08B5aae0',
    '0xc778417e063141139fce010982780140aa0cd5ab'
  ];

  const web3js = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/83dc80d8a0ea430a86135e955f7bfdba'));

  const handleWalletAddressChanged = async (e: any) => {
    setWalletAddress(e.target.value);
  }

  const handleTokenAddressChanged = async (e: any) => {
    setTokenAddress(e.target.value);
  }

  const getData = async () => {
    try {
      console.log('loading...');
      let walletInfo: any = {};
      let tokenInfoArray: any = []; 
      let ethBalance = await web3js.eth.getBalance(walletAddress);
      ethBalance = web3js.utils.fromWei(ethBalance, "ether");
      walletInfo.balance = ethBalance;

      if (tokenAddress != '') {
        const tokenContract = new web3js.eth.Contract(ERC20ABI.abi as AbiItem[],tokenAddress);
        let tokenInfo: any = {};
        tokenInfo.name = await tokenContract.methods.name().call();
        tokenInfo.symbol = await tokenContract.methods.symbol().call();
        tokenInfo.decimal = await tokenContract.methods.decimals().call();
        let balance = await tokenContract.methods.balanceOf(walletAddress).call();
        let decimal = 10 ** tokenInfo.decimal;
        tokenInfo.balance = balance/ decimal;
        tokenInfoArray.push(tokenInfo);
        walletInfo.positions  = tokenInfoArray;
      } else {
        for (let i = 0; i < tokenAddresses.length; i ++) {
          const tokenContract = new web3js.eth.Contract(ERC20ABI.abi as AbiItem[],tokenAddresses[i]);
          let tokenInfo: any = {};
          tokenInfo.name = await tokenContract.methods.name().call();
          tokenInfo.symbol = await tokenContract.methods.symbol().call();
          tokenInfo.decimal = await tokenContract.methods.decimals().call();
          let balance = await tokenContract.methods.balanceOf(walletAddress).call();
          let decimal = 10 ** tokenInfo.decimal;
          tokenInfo.balance = balance/ decimal;
          tokenInfoArray.push(tokenInfo);
        }
        walletInfo.positions  = tokenInfoArray;
      }
      const currentBlock: any = await web3js.eth.getBlockNumber();
      let txCnt = await web3js.eth.getTransactionCount(walletAddress, currentBlock);
      console.log('currentBlock is ', currentBlock);
      console.log('txCnt is ', txCnt);
      let transactions: any = [];

      for (let i = currentBlock; i >= 0 && (txCnt > 0); --i) {
        let block = await web3js.eth.getBlock(i, true);
        if (block && block.transactions) {
          let tranactionLength = block.transactions.length;
          for (let j = 0; j < tranactionLength; j ++) {
            console.log('from is ', block.transactions[j].from);
            console.log('to is ', block.transactions[j].to);
            if (walletAddress === block.transactions[j].from || walletAddress === block.transactions[j].to) {
              console.log(block.transactions[j]);
              transactions.push(block.transactions[j]);
              txCnt --;
            }
          }
        }
      }
      walletInfo.transactions = transactions;
      console.log(walletInfo);
    } catch(e: any) {
      console.log(e);
    }
  }

  return (
    <div className="App">
      <div className="div-item">
        <span className="item-title">Wallet Address: </span>
        <input type="text" className="token-amount" value={walletAddress} onChange={(e) => handleWalletAddressChanged(e)} />
      </div>

      <div className="div-item">
        <span className="item-title">Token Address: </span>
        <input type="text" className="token-amount" value={tokenAddress} onChange={(e) => handleTokenAddressChanged(e)} />
      </div>

      <div className="div-btn">
        <button className="btn-get" onClick={getData}>Get Data</button>
      </div>
    </div>
  );
}

export default App;
