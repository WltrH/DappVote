const voting = artifacts.require("./voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('voting', accounts =>{

    const owner = accounts[0];
    const voter = accounts[1];
    const voter2 = accounts[2];

    let votingInstance;

/*=========================================== TESTS SUR LA FONCTION D'AJOUT DE VOTER =================================================== */

    describe("test de la fonction addVoter", function(){

        beforeEach(async function (){
            votingInstance = await voting.new({from:owner});
            await votingInstance.addVoter(voter, {from:owner});
        });

        it('should owner could not add voter', async () => {
          await votingInstance.startProposalsRegistering({from:owner});
          await expectRevert(votingInstance.addVoter(voter, {from:owner}),"Voters registration is not open yet");
      });

        it('should voter is whiteListed', async () => {
            const storedata = await votingInstance.getVoter(voter, {from:voter});
            console.log(storedata.isRegistered);
            expect(storedata.isRegistered).to.equal(true);
        });

        it('should voter is not whiteListed', async () => {
            const storedata = await votingInstance.getVoter(voter2, {from:voter});
            console.log(storedata.isRegistered);
            expect(storedata.isRegistered).to.equal(false);
        });


    });

/*=========================================== TESTS SUR LA FONCTION DE PROPOSITION =================================================== */

    describe("Test fonction addProposal", function(){

      beforeEach(async function (){
        votingInstance = await voting.new({from:owner});
        await votingInstance.addVoter(voter, {from:owner});
        await votingInstance.addVoter(voter2, {from:owner});
        await votingInstance.startProposalsRegistering({from:owner});
            
      });

      it('should proposals are not allowed yet', async () => {
        await votingInstance.endProposalsRegistering({from:owner});
        await expectRevert(votingInstance.addProposal("Pays de Gales Independant",{from:voter}), "Proposals are not allowed yet");
      });

      it('should voter could not add empty proposal', async () => {   
        await expectRevert(votingInstance.addProposal("", {from:voter}),"Vous ne pouvez pas ne rien proposer");
      });
  
      it('should voter return proposal', async () => { 
        const storedata = await votingInstance.addProposal("On en a gros", {from:voter});
        const storedata2 = await votingInstance.addProposal("Cramez tout je vous dis", {from:voter2});
        expectEvent(storedata, 'ProposalRegistered',{proposalId : new BN(0)});
        expectEvent(storedata2, 'ProposalRegistered',{proposalId : new BN(1)});
      });

    });


    /*=========================================== TESTS SUR LES FONCTIONS DE CHANGEMENT DE WORKFLOW =================================================== */

    describe("Test du Modifier & require des Workflow", function(){

      beforeEach(async function (){
        votingInstance = await voting.new({from:owner});
        await votingInstance.addVoter(voter, {from:owner});
        await votingInstance.startProposalsRegistering({from:owner});
      });

      it('should owner cant addProposal', async () => {
        await expectRevert(votingInstance.addProposal("Pays de Gales Independant", {from:owner}), "You're not a voter");
      });

      it('should owner cant change for starting vote', async () => {
        await expectRevert(votingInstance.startVotingSession({from:owner}), "Registering proposals phase is not finished");
      });

      it('should owner cant change for ending vote', async () => {
        await expectRevert(votingInstance.endVotingSession({from:owner}), "Voting session havent started yet");
      });

      it('should owner cant change for start tally vote', async () => {
        await expectRevert(votingInstance.tallyVotes({from:owner}), "Current status is not voting session ended");
      });

      it('should owner cant change for start proposal', async () => {
        await expectRevert(votingInstance.startProposalsRegistering({from:owner}), "Registering proposals cant be started now");
      }); 

    });
/*=========================================== TESTS SUR LA FONCTION DE VOTE =================================================== */
    describe("Test du vote", function(){

      beforeEach(async function() {
        votingInstance = await voting.new({from:owner});
        await votingInstance.addVoter(voter, {from:owner});
        await votingInstance.startProposalsRegistering({from:owner});
        await votingInstance.addProposal("cest pas faux", {from:voter});
        await votingInstance.endProposalsRegistering({from:owner});
        await votingInstance.startVotingSession({from:owner});

      });

      it('should voter have already voted', async () => {
        await votingInstance.setVote(new BN(0),{from:voter});
        await expectRevert(votingInstance.setVote(new BN(0),{from:voter}), "You have already voted");
      });

      it ('should voter have voted', async () => {
        await votingInstance.setVote(new BN (0),{from:voter});
        const storedata = await votingInstance.getVoter(voter, {from:voter});
        console.log(storedata.hasVoted);
        expect(storedata.hasVoted).to.equal(true);
      });

      it('should voter set vote', async ()  =>{
        const storedata = await votingInstance.setVote(new BN (0),{from:voter});
        expectEvent(storedata, 'Voted', {proposalId: new BN (0)});
      });

    });

    /*=========================================== TESTS SUR LA FONCTION DU GAGNANT =================================================== */

    describe("Test de TallyVote", function(){

      beforeEach(async function() {
        votingInstance = await voting.new({from:owner});
        await votingInstance.addVoter(voter, {from:owner});
        await votingInstance.addVoter(voter2, {from:owner});
        await votingInstance.startProposalsRegistering({from:owner});
        await votingInstance.addProposal("cest pas faux", {from:voter});
        await votingInstance.endProposalsRegistering({from:owner});
        await votingInstance.startVotingSession({from:owner});          
      });

      it ('should vote have not ended', async () => {
        await expectRevert(votingInstance.tallyVotes ({from:owner}),"Current status is not voting session ended");
      });

      it ('should vote have a winning Proposal', async () => {
        await votingInstance.setVote(new BN (0),{from:voter});
        await votingInstance.setVote(new BN (0),{from:voter2});
        await votingInstance.endVotingSession({from:owner});
        const storedata = await votingInstance.tallyVotes ({from:owner});
        expect(new BN(storedata.winningProposalID)).to.be.bignumber.equal(new BN(0));
      });

      it ('should return workflowstatus', async () => {
        await votingInstance.endVotingSession({from:owner});
        const storedata = await votingInstance.tallyVotes({from:owner});
        expectEvent(storedata, 'WorkflowStatusChange',{previousStatus : new BN(4), newStatus : new BN(5)});
      });
    });

});

