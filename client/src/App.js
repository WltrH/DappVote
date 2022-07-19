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
  const [winner,setWin] = useState("");
  const [voterArray, setVoterA] = useState([]);
  const [propalArray, setProposalA] = useState([]);
  const [votedIdArray, setVotedIdA] = useState([]);
  const [workf, setWork] = useState ("registering voters");

  

  

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
        //let text = (null);
        
        setWeb3(web3provider);
        setAddress(accounts);
        setContract(instance);
        setOwner(contractOwner);


        console.log(contract);
        console.log(web3);

        
      }
      catch (error) {
        // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);

      }
     }

  }, []);
  console.log("contract :",contract);
  console.log("web3 :",web3);
  console.log("Worflow :",workf);

 
  //:::::::::::::::::::::::::::::: Gestion des Events :::::::::::::::::::::::::::::::://


 useEffect (() => {

  async function setEvent() {
    if (contract){

      let options = {
        fromBlock: 0,
        toBlock: 'latest'
      };
    
      let options1 = {
        fromBlock: 0,                 
      };
  
      let listAddress = await contract.getPastEvents('VoterRegistered', options);
      let listId = await contract.getPastEvents('ProposalRegistered', options1);
      let listVote = await contract.getPastEvents('Voted', options1);
  
    
        contract.events.VoterRegistered(options)
          .on('data', event => listAddress.push(event));
  
        contract.events.ProposalRegistered(options1)
          .on('data', event => listId.push(event));
  
        contract.events.Voted(options1)
          .on('data', event => listVote.push(event));
  
        contract.events.idVoted(options1)
          .on('data', event => console.log('ICI ID VOTE GAGNANT' ,event));
  
  
  
        setVoterA(listAddress);
        setProposalA(listId);
        setVotedIdA(listVote);
    }
      

  }  
    setEvent();
  }, []);


  //:::::::::::::::::::::::::::::: Workflow Status :::::::::::::::::::::::::::::::://

  useEffect (() => {
    updateWorflowStatus();
  }, []);

  async function updateWorflowStatus (){
      if(contract){
        const idStatus = await contract.methods.workflowStatus().call({from: accounts[0]});
        textStatus(idStatus);
      }
  }

  function textStatus(id) {
    switch(id) {
      case "0":
        setWork("Regestering Voters");
        break;
      case "1":
        setWork("Proposals registration started");
        break;
      case "2":
       setWork("Proposals registering ended");
       break;
      case "3":
        setWork("Voting session started");
        break;
      case "4":
        setWork("Voting session ended");
        break;
      case "5":
       setWork("Vote tallied");
       break;
      default:
        setWork("Status error")
    }
  }

  //:::::::::::::::::::::::::::::: Rafraichissemenbt de la page :::::::::::::::::::::::::::::::://

  window.onload = updateWorflowStatus();


  //:::::::::::::::::::::::::::::: Fonctions du contrat :::::::::::::::::::::::::::::::://


  function changeValueInput(e){
    setInputValue(e.target.value);
  }

  
  async function addVoter(){
    await contract.methods.addVoter(inputValue).send({from : accounts[0]});
    console.log(inputValue);
    console.log(owner);
  }

  async function addProposal(){
    await contract.methods.addProposal(inputValue).send({from : accounts[0]});
    console.log(inputValue);
  }

  async function addVoteProposal(){
    await contract.methods.setVote(inputValue).send({from : accounts[0]});
    await console.log(inputValue);
  }

  async function TallyVote(){

    await contract.methods.tallyVotes().send({from : accounts[0]});
    const winProposal = await contract.methods.winningProposalID().call({from : accounts[0]});
    setWin (winProposal);
    console.log("Vote constante winningProposal",winProposal);
    console.log("Vote constante winner",winner);
  }




 //:::::::::::::::::::::::::::::: Changement de Status :::::::::::::::::::::::::::::::://



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

 //:::::::::::::::::::::::::::::: Page Web :::::::::::::::::::::::::::::::://


    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
     
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>

        {accounts}
        <h2>Owner du Contract</h2>
        {owner}

        <h2>Workflow status</h2>
        {workf}
        <h2>Veuillez rentrer un voter</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <button className='btn-Voter' onClick={addVoter} >Add voter</button>
        <table>
          <caption>Voters enregistrés</caption>
         
          <tr>
            <th>Address Voters</th>
           </tr>
           <tr>
           {voterArray.map((adresse) => (
                  <tr><td>{adresse.returnValues.voterAddress} </td></tr>
                ))}
          </tr>
        </table>
        

        <h2>Veuillez rentrer une proposition</h2>
        <input type='text' placeholder='Paste proposition here ..' onChange={(e) => changeValueInput(e)}/>
        <button className='btn-Proposal' onClick={addProposal} >Add proposal</button>
        <table>
          <thead>
              <tr>
                <th colSpan="2">tableau proposition</th>
              </tr>
          </thead>

          <caption>Tableau des propositions</caption>

            <tr>
            {propalArray.map((adresse) => (
                <td>{adresse.returnValues.proposalId} </td>
              ))}
            </tr>
            <tr>
            {propalArray.map((adresse) => (
                <td>{adresse.returnValues.descPropal}</td>
              ))}
            </tr>
        </table>
       
        <h2>Veuillez rentrer votre vote</h2>
        <input type='text' placeholder='Paste proposition that you want vote for here ..' onChange={(e) => changeValueInput(e)}/>
        <button className='btn-VoteProposal' onClick={addVoteProposal} >Add VoteProposal</button>
        <table>
          <thead>
            <tbody>
              <tr>
                <td>Vote effectué</td>
                {votedIdArray.map((adresse) => (
                  <tr><td>{adresse.returnValues.voter} {adresse.returnValues.proposalId} </td></tr>
                ))}
                
              </tr>
            </tbody>
          </thead>

        </table>

        <h2>Résultat du vote</h2>
        
        {winner}
        {winner}
        
        <h2>Changement de status</h2>
        <button className='btn-startProposalsRegistering' onClick={startProposal} >Start Proposal</button> 
        <button className='btn-endProposalsRegistering' onClick={endProposal} >End Proposal</button>
        <button className='btn-startVotingSession' onClick={startVoting} >Start Voting</button> 
        <button className='btn-endVotingSession' onClick={endVoting} >End Voting</button>
        <button className='btn-Tallyvote' onClick={TallyVote} >Résultat vote</button>
        
      </div>
    );
   
}

export default App;
