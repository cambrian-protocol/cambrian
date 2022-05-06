// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

import "./interfaces/ISolver.sol";
import "./SolverLib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BasicArbitrator is Ownable, ReentrancyGuard {
    struct Dispute {
        ISolver solver;
        uint256 conditionIndex;
        uint256 fee;
        bytes32 id;
        address[] disputers;
        uint256[][] choices;
    }

    uint256 public fee; // wei

    mapping(bytes32 => Dispute) public disputes; // keccak256(abi.encode(address solver, conditionIndex)) => Dispute

    mapping(address => uint256) public balances;

    modifier isRequested(bytes32 disputeId) {
        Dispute storage dispute = disputes[disputeId];

        require(
            dispute.solver.getStatus(dispute.conditionIndex) ==
                SolverLib.Status.ArbitrationRequested,
            "Arbitration not requested"
        );
        _;
    }

    /**
     * @notice Sets fee and immediately transfers ownership to _newOwner
     * @param _fee Arbitration fee (per disputer) in wei
     * @param _newOwner Address to immediately transfer ownership to
     */
    constructor(uint256 _fee, address _newOwner) {
        fee = _fee;
        transferOwnership(_newOwner);
    }

    /**
     * @notice If Dispute already exists, returns the fee from when was created. Else, the current fee
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getFee(bytes32 disputeId) public view returns (uint256) {
        if (disputes[disputeId].id != bytes32("")) {
            // Dispute exists
            return disputes[disputeId].fee;
        } else {
            return fee;
        }
    }

    /**
     * @notice Set a new arbitration fee. Does not affect active Disputes
     * @dev onlyOwner
     * @param _fee New fee in wei
     */
    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    /**
     * @notice Receives an arbitration request from a disputer
     * @dev Callable only during Solver timelock
     * @dev Only callable by recipients of the Solver condition
     * @dev Only callable while Solver condition is Status.OutcomeProposed or Status.ArbitrationRequested
     * @param solver Address of solver
     * @param conditionIndex Index of condition for which arbitration is being requested
     * @param desiredOutcome Outcome report being requested by the disputer
     */
    function requestArbitration(
        ISolver solver,
        uint256 conditionIndex,
        uint256[] calldata desiredOutcome
    ) external payable {
        address _arbitrator = solver.arbitrator();
        require(_arbitrator == address(this), "Wrong arbitrator");
        require(
            block.timestamp < solver.timelocks(conditionIndex),
            "Must be in timelock"
        );
        require(
            solver.isRecipient(msg.sender, conditionIndex),
            "Only recipients"
        );

        SolverLib.Status status = solver.getStatus(conditionIndex);

        require(
            status == SolverLib.Status.OutcomeProposed ||
                status == SolverLib.Status.ArbitrationRequested,
            "Condition status invalid for arbitration"
        );

        bytes32 _disputeId = keccak256(abi.encode(solver, conditionIndex));

        require(msg.value >= getFee(_disputeId), "Insufficient fee");

        Dispute storage dispute = disputes[_disputeId];

        // Create Dispute if it doesn't exist
        if (dispute.id == bytes32("")) {
            dispute.id = _disputeId;
            dispute.solver = solver;
            dispute.conditionIndex = conditionIndex;
            dispute.fee = fee;
        }

        dispute.disputers.push(msg.sender);
        dispute.choices.push(desiredOutcome);
        solver.arbitrationRequested(conditionIndex);
    }

    /**
     * @notice Deliver a null arbitration
     * @dev Callable on any active dispute
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function arbitrateNull(bytes32 disputeId)
        external
        onlyOwner
        isRequested(disputeId)
    {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.id == disputeId, "Invalid Dispute");

        dispute.solver.arbitrateNull(dispute.conditionIndex);
    }

    /**
     * @notice Deliver arbitration
     * @dev Callable only when timelock has passed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param choice index of the chosen desiredOutcome from dispute.choices
     */
    function arbitrate(bytes32 disputeId, uint256 choice)
        external
        onlyOwner
        isRequested(disputeId)
    {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.id == disputeId, "Invalid Dispute");

        require(
            block.timestamp > dispute.solver.timelocks(dispute.conditionIndex),
            "Timelocked"
        );

        dispute.solver.arbitrate(
            dispute.conditionIndex,
            dispute.choices[choice]
        );

        imburse(disputeId, choice);
    }

    /**
     * @notice Adds withdrawal balance to the arbitrator and disputers who's choice matched the arbitrator's ruling
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param choice index of the chosen desiredOutcome from dispute.choices
     */
    function imburse(bytes32 disputeId, uint256 choice) private {
        Dispute storage dispute = disputes[disputeId];

        uint256 remainingFee = dispute.fee * dispute.disputers.length;

        for (uint256 i; i < dispute.disputers.length; i++) {
            if (
                keccak256(abi.encode(dispute.choices[i])) ==
                keccak256(abi.encode(dispute.choices[choice]))
            ) {
                balances[dispute.disputers[i]] += dispute.fee;
                remainingFee -= dispute.fee;
            }
        }

        balances[owner()] += remainingFee;
    }

    /**
     * @notice Gets timelock of the condition being disputed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function timelock(bytes32 disputeId)
        public
        view
        returns (uint256 timelock)
    {
        timelock = disputes[disputeId].solver.timelocks(
            disputes[disputeId].conditionIndex
        );
    }

    /**
     * @notice Withdraws ETH and reduces balance of msg.sender
     */
    function withdraw() external nonReentrant {
        require(balances[msg.sender] > 0, "No balance");
        uint256 balance = balances[msg.sender];
        balances[msg.sender] -= balance;
        (bool success, bytes memory ret) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Increases current owner's balance
     */
    receive() external payable {
        balances[owner()] += msg.value;
    }
}
