import React, { useState, useEffect } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App () {
  //state = { storageValue: 0, web3: null, accounts: null, contract: null, addresses: null };
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccount] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [owner, setOwner] = useState(null);


  useEffect (() => {
     setupWeb3 ();
     async function setupWeb3() {
      try {
        const web3provider = await getWeb3();
        const accounts = await web3provider.eth.getAccounts();

        const networkId = await web3provider.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];
        const instance = new web3provider.eth.Contract(
          VotingContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        setWeb3(web3provider);
        setAccount(accounts);
        setContract(instance);
        setOwner(accounts[0]);
      }
      catch (error) {
        // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);

      }
     }
     console.log(web3);
     console.log(contract);
  });
  
  //faire les fonctions pour interagir avec le contrat

  function changeValueInput(e){
    //console.log(e.target.value);
    setInputValue(e.target.value);
  }

  function addVoter () {
    contract.methods.addVoter(inputValue).send({from : owner});
    console.log(inputValue);
    console.log(owner);

  };

  function setProposal (proposal) {
    console.log();

  };

  function setVoteProposal (id) {
    console.log();

  };

  function WiningProposal () {
    console.log();

  };

    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>

        {owner}

        
        <h2>Veuillez rentrer un voter</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <button className='btn-Voter' onClick={addVoter} >Add voter</button>

        <h2>Veuillez rentrer une proposition</h2>
        <input type='text' placeholder='Paste proposition here ..'/>
        <button className='btn-Proposal' onClick={setProposal} >Add proposal</button>

        <h2>Veuillez rentrer votre vote</h2>
        <input type='text' placeholder='Paste proposition that you want vote for here ..'/>
        <button className='btn-VoteProposal' onClick={setVoteProposal} >Add VoteProposal</button>
      </div>
    );
  
}

export default App;
