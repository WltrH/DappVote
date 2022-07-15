import React, { useState, useEffect } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App () {
  //state = { storageValue: 0, web3: null, accounts: null, contract: null, addresses: null };
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAddress] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [owner, setOwner] = useState(null);
  const [winner,setWin] = useState(null);
  //const [proposal, setProp] = useState(null);


  


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
        const contractOwner = await instance.methods.owner().call();
        //const status = await contract.methods.workflowStatus().call({from: accounts[0]});


        setWeb3(web3provider);
        setAddress(accounts);
        setContract(instance);
        setOwner(contractOwner);
        
        //events try
        let options = {
          
          fromBlock: 0,
          toBlock: 'latest'
        };

        //const listAddr = await contract.getPastEvents('dataStored', options);

        contract.events.ProposalRegistered(options)
          .on('data', event => console.log(event))
          .on('changed', changed => console.log(changed))
          .on('error', err => {throw err})
          .on('connected', str => console.log(str))



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
    console.log(e.target.value);
    setInputValue(e.target.value);
  }

  
  async function addVoter(){
    await contract.methods.addVoter(inputValue).send({from : accounts[0]});
    console.log(inputValue);
    console.log(owner);
  }

  async function addProposal(){
    await contract.methods.addProposal(inputValue).send({from : accounts[0]});
    //setProp (await contract.event.ProposalRegistered().call)
    console.log(inputValue);
  }

  async function addVoteProposal(){
    await console.log(inputValue);
  }

  async function TallyVote(){
    await contract.methods.tallyVotes().call({from : accounts[0]});
    console.log();
  }
  async function result (){
    setWin (await contract.methods.winningProposalID().call({from : accounts[0]}));
  }
  //========================== STATUS ==================================


  function startProposal () {
    contract.methods.startProposalsRegistering().send({from : accounts[0]});
  }

  function endProposal () {
    contract.methods.endProposalsRegistering().send({from : accounts[0]});
  }

  function startVoting () {
    contract.methods.startVotingSession().send({from : accounts[0]});
  }

  function endVoting () {
    contract.methods.endVotingSession().send ({from : accounts[0]});
  }

  function startAddVoter () {
    contract.methods.startVoterRegistering().send ({from : accounts[0]});
  }
//========================================================================

    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>

        {accounts}
        <h2>TEST</h2>
        {owner}

        
        <h2>Veuillez rentrer un voter</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <button className='btn-Voter' onClick={addVoter} >Add voter</button>

        <h2>Veuillez rentrer une proposition</h2>
        <input type='text' placeholder='Paste proposition here ..' onChange={(e) => changeValueInput(e)}/>
        <button className='btn-Proposal' onClick={addProposal} >Add proposal</button>
       
        <h2>Veuillez rentrer votre vote</h2>
        <input type='text' placeholder='Paste proposition that you want vote for here ..' onChange={(e) => changeValueInput(e)}/>
        <button className='btn-VoteProposal' onClick={addVoteProposal} >Add VoteProposal</button>

        <h2>Résultat du vote</h2>
        <button className='btn-Tallyvote' onClick={TallyVote} >Résultat vote</button>
        <button className='btn-Tallyvote' onClick={result} >Résultat vote</button>
        {winner}
        
        <h2>Changement de status</h2>
        <button className='btn-startProposalsRegistering' onClick={startProposal} >Start Proposal</button> 
        <button className='btn-endProposalsRegistering' onClick={endProposal} >End Proposal</button>
        <button className='btn-startVotingSession' onClick={startVoting} >Start Voting</button> 
        <button className='btn-endVotingSession' onClick={endVoting} >End Voting</button>
        <button className='btn-startAddVoterSession' onClick={startAddVoter} >Start add Voter</button>
        
        
      </div>
    );
  
}

export default App;
