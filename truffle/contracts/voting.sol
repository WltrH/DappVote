// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/// @title Une application de vote
/// @author Cyril Castagnet

contract Voting is Ownable {


    uint public winningProposalID;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //
    /// @notice Permettre de récupérer la structure d'un voter par son adresse.
    /// @dev La function prend le paramètre d'un modifier "onlyVoters".
    /// @param _addr l'adresse du voter que l'on souhaite récupérer.
    /// @return _addr l'adresse du voter se trouvant dans la structure

    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }

    /// @notice Permettre de récupérer la structure d'une proposition par son identifiant.
    /// @dev La function prend le paramètre d'un modifier "onlyVoters".
    /// @param _id l'idnetidiant de la propostion que l'on souhaite récupérer.
    /// @return _id l'identifiant du la proposition se trouvant dans la structure
    
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /// @notice Permettre l'ajout d'un voter la structure d'un voter par son adresse.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul l'émetteur du contrat peut rentrer un voter.
    /// @dev Un workflow RegisteringVoters doit être mis en status pour accéder à la fonction.
    /// @dev Un voter ne peut être enregistré qu'une seule fois.
    /// @param _addr l'adresse du voter que l'on souhaite récupérer.
    /// @custom:event pour connaitre l'adresse du nouveau voter dans les logs

    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
        require(proposalsArray.length <= 100, "you reach the maximum proposal" );
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /// @notice Permettre l'ajout d'une nouvelle proposition dans la structure d'une proposition par sa description.
    /// @dev La function prend le paramètre d'un modifier "onlyVoters".
    /// @dev Seul les voters enregistrés peuvent rentrer une proposition.
    /// @dev Un workflow ProposalsRegistrationStarted doit être mis en status pour accéder à la fonction.
    /// @dev Un voter ne peut pas ne rien proposer en proposition.
    /// @param _desc Est la description de la proposition enregistrée.
    /// @dev la proposition est envoyée dans la structure
    /// @custom:event pour savoir si la proposition a bien été enregistré.

    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif

        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //
    /// @notice Permettre le vote pour les propositions enregistrée précédement.
    /// @dev La function prend le paramètre d'un modifier "onlyVoters".
    /// @dev Seul les voters enregistrés peuvent voter pour une proposition enregistrée.
    /// @dev Un workflow VotingSessionStarted doit être mis en status pour accéder à la fonction.
    /// @dev Un voter ne peut pas voter plus d'une fois.
    /// @dev Un vote n'est pris en compte que si la proposition existe.
    /// @param _id Est l'identifiant de la proposition pour laquelle un voter vote.
    /// @dev le vote pour la proposition est envoyé dans la structure du voter et la proposition prend un +1 vote dans sa structure.
    /// @custom:event pour connaitre l'adresse du voter et l'identifiant de la proposition pour laquelle il a voté.

    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice Permettre de changer le status pour ProposalsRegistrationStarted.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul le owner du  contrat peut changer de status.
    /// @dev Un workflow RegisteringVoters doit être mis en status pour accéder à la fonction.
    /// @custom:event pour connaitre l'ancien et le nouveau status.

    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice Permettre de changer le status pour ProposalsRegistrationEnded.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul le owner du  contrat peut changer de status.
    /// @dev Un workflow ProposalsRegistrationStarted doit être mis en status pour accéder à la fonction.
    /// @custom:event pour connaitre l'ancien et le nouveau status.

    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice Permettre de changer le status pour VotingSessionStarted.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul le owner du  contrat peut changer de status.
    /// @dev Un workflow ProposalsRegistrationEnded doit être mis en status pour accéder à la fonction.
    /// @custom:event pour connaitre l'ancien et le nouveau status.

    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice Permettre de changer le status pour VotingSessionEnded.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul le owner du  contrat peut changer de status.
    /// @dev Un workflow VotingSessionStarted doit être mis en status pour accéder à la fonction.
    /// @custom:event pour connaitre l'ancien et le nouveau status.

    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    function startVoterRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, 'Voting session havent ended yet');
        workflowStatus = WorkflowStatus.RegisteringVoters;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.RegisteringVoters);
    }

    /// @notice Permettre de compter les votes pour déterminer la proposition gagnante.
    /// @dev La function prend le paramètre d'un modifier "onlyOwner" qui se trouve dans l'import openZeppelin.
    /// @dev Seul le owner du  contrat peut demander le compte des votes.
    /// @dev Un workflow VotingSessionEnded doit être mis en status pour accéder à la fonction.
    /// @dev Boucle pour rechercher la proposition ayant le plus de vote
    /// @custom:event pour connaitre l'ancien et le nouveau status.

   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       uint _winningProposalId;
      for (uint256 p = 0; p < proposalsArray.length; p++) {
           if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
               _winningProposalId = p;
          }
       }
       winningProposalID = _winningProposalId;
       
       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}