import React, { useState, useEffect } from "react";
import Whitelist from "./contracts/Whitelist.json";
import getWeb3 from "./getWeb3";
 
import "./App.css";
 
function App() {
 
  const [whitelistedValue, setWhitelistedValue] = useState(false);
  const [inputValue, setInputValue] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [addresses, setAddresses] = useState(null);
 
  useEffect(() => {
    fetchData();
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
 
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
 
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Whitelist.networks[networkId];
        const instance = new web3.eth.Contract(
          Whitelist.abi,
          deployedNetwork && deployedNetwork.address,
        );
 
       // const response = await instance.methods.isWhitelisted(accounts[0]).call();
        // Set web3, accounts, and contract to the state, and then proceed with an
 
        setWeb3(web3);
        setContract(instance);
        setAddresses(accounts);
 
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
  },[]);
 
  function changeValueInput(e){
    console.log(e.target.value);
    setInputValue(e.target.value);
  }
 
  async function handleAddWhitelist(){
    if(inputValue.length === 42){
      await contract.methods.addToWhitelist(inputValue).send({ from: addresses[0]});
    }
  }
 
  async function handleRemoveWhitelist(){
    if(inputValue.length === 42){
      await contract.methods.removeFromWhitelist(inputValue).send({ from: addresses[0]});
    }
  }
 
  async function isWhitelisted(){
    const data = await contract.methods.isWhitelisted(inputValue).call();
    setWhitelistedValue(data);
    console.log(data);
  }
 
  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
     <button className='btn-connect-wallet'>Connect Wallet</button>
     <div className='panel-whitelist'>
      <div className='box-whitelist'>
        <h2>Whitelist Panel</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <div>
          <button className='btn-whitelist' onClick={handleAddWhitelist} >Add to whitelist</button>
          <button className='btn-whitelist' onClick={handleRemoveWhitelist} >Remove from whitelist</button>
          <button className='btn-whitelist' onClick={isWhitelisted} >Check isWhitelist</button>
        </div>
        <p>Data: {`${whitelistedValue}`}</p>
      </div>
     </div>
    </div>
  );
}
 
export default App;
RAW Paste Data 
import React, { useState, useEffect } from "react";
import Whitelist from "./contracts/Whitelist.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {

  const [whitelistedValue, setWhitelistedValue] = useState(false);
  const [inputValue, setInputValue] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [addresses, setAddresses] = useState(null);

  useEffect(() => {
    fetchData();
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
  
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
  
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Whitelist.networks[networkId];
        const instance = new web3.eth.Contract(
          Whitelist.abi,
          deployedNetwork && deployedNetwork.address,
        );
        
       // const response = await instance.methods.isWhitelisted(accounts[0]).call();
        // Set web3, accounts, and contract to the state, and then proceed with an

        setWeb3(web3);
        setContract(instance);
        setAddresses(accounts);

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
  },[]);

  function changeValueInput(e){
    console.log(e.target.value);
    setInputValue(e.target.value);
  }

  async function handleAddWhitelist(){
    if(inputValue.length === 42){
      await contract.methods.addToWhitelist(inputValue).send({ from: addresses[0]});
    }
  }

  async function handleRemoveWhitelist(){
    if(inputValue.length === 42){
      await contract.methods.removeFromWhitelist(inputValue).send({ from: addresses[0]});
    }
  }

  async function isWhitelisted(){
    const data = await contract.methods.isWhitelisted(inputValue).call();
    setWhitelistedValue(data);
    console.log(data);
  }

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
     <button className='btn-connect-wallet'>Connect Wallet</button>
     <div className='panel-whitelist'>
      <div className='box-whitelist'>
        <h2>Whitelist Panel</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <div>
          <button className='btn-whitelist' onClick={handleAddWhitelist} >Add to whitelist</button>
          <button className='btn-whitelist' onClick={handleRemoveWhitelist} >Remove from whitelist</button>
          <button className='btn-whitelist' onClick={isWhitelisted} >Check isWhitelist</button>
        </div>
        <p>Data: {`${whitelistedValue}`}</p>
      </div>
     </div>
    </div>
  );
}

async function addProposal () {
  await contract.methods.addProposal(inputValue).send({from : accounts[0]});
  console.log(inputValue);

}

async function addVoteProposal () {
  await console.log(inputValue);
}

async function TallyVote () {
  await console.methods.tallyVotes().call({from : owner});
  console.log();
}
