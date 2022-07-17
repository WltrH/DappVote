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
  const [workf, setWork] = useState (0);

  

  

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
        setWork (await instance.methods.workflowStatus().call({from: accounts[0]}));
        console.log(workf);
        //let text = (null);


        switch (workf){
          case 0:
            console.log("Enregistrement des votes");
            break;
          case 1:
            console.log("Enregistrement proposition ouverte");
            break;
          case 2:
            console.log("Enregistrement proposition fermé"); 
            break;
          case 3:
            console.log("Début de la votation");
            break;
          case 4:
            console.log("Votation fermé");
            break;
          case 5:
            console.log("Comptage des votes");
            break;
          default:
            console.log("Enregistrement des voters");
        }
        
        //events try

        let options = {
          fromBlock: 0,
          toBlock: 'latest'
        };
        
        let options1 = {
          fromBlock: 0,                 
        };

        let listAddress = await instance.getPastEvents('VoterRegistered', options);
        let listId = await instance.getPastEvents('ProposalRegistered', options1);
        let listVote = await instance.getPastEvents('Voted', options1);

        
        instance.events.VoterRegistered(options)
            .on('data', event => listAddress.push(event));

        instance.events.ProposalRegistered(options1)
            .on('data', event => listId.push(event));

        instance.events.Voted(options1)
            .on('data', event => listVote.push(event));

        instance.events.idVoted(options1)
            .on('data', event => console.log('ICI ID VOTE GAGNANT' ,event));
          

        
        
        
        setWeb3(web3provider);
        setAddress(accounts);
        setContract(instance);
        setOwner(contractOwner);
        setVoterA(listAddress);
        setProposalA(listId);
        setVotedIdA(listVote);

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
  //faire les fonctions pour interagir avec le contrat

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
    //setProposalA (await contract.event.ProposalRegistered().call)
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




  //========================== STATUS ==================================


  function startProposal () {
    contract.methods.startProposalsRegistering().send({from : accounts[0]});
    //const workf = await contract.methods.workflowStatus().call({from : accounts[0]});
    //console.log(workf);
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
//================================Page Web========================================

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

        
        <h2>Veuillez rentrer un voter</h2>
        <input type='text' placeholder='Paste address here ..' onChange={(e) => changeValueInput(e)} />
        <button className='btn-Voter' onClick={addVoter} >Add voter</button>
        <table>
          <thead>
              <tr>
                <th colspan="2">tableau votant</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                <td>adress votant</td>
                {voterArray.map((adresse) => (
                  <tr><td>{adresse.returnValues.voterAddress} </td></tr>
                ))}
              </tr>
          </tbody>
        </table>

        <h2>Veuillez rentrer une proposition</h2>
        <input type='text' placeholder='Paste proposition here ..' onChange={(e) => changeValueInput(e)}/>
        <button className='btn-Proposal' onClick={addProposal} >Add proposal</button>
        <table>
          <thead>
              <tr>
                <th colspan="2">tableau proposition</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                <td>id</td>
                {propalArray.map((adresse) => (
                  <tr><td>{adresse.returnValues.proposalId} </td></tr>
                ))}
                <td>nom proposition</td>
                {propalArray.map((adresse) => (
                  <tr><td>{adresse.returnValues.descPropal}</td></tr>
                ))}
              </tr>
          </tbody>
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
        <button className='btn-Tallyvote' onClick={TallyVote} >Résultat vote</button>
        {winner}

       
        
        <h2>Changement de status</h2>
        <button className='btn-startProposalsRegistering' onClick={startProposal} >Start Proposal</button> 
        <button className='btn-endProposalsRegistering' onClick={endProposal} >End Proposal</button>
        <button className='btn-startVotingSession' onClick={startVoting} >Start Voting</button> 
        <button className='btn-endVotingSession' onClick={endVoting} >End Voting</button>
        <button className='btn-startAddVoterSession' onClick={startAddVoter} >Start add Voter</button>
        {workf}
        
      </div>
    );
  
}

export default App;
