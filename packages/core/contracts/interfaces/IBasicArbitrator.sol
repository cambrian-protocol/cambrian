// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.14;
import "./ISolver.sol";

interface IBasicArbitrator {
    /**
     * @notice Sets fee and immediately transfers ownership to _newOwner
     * @param initParams bytearray of init parameters
     * @dev _newOwner | Address to immediately transfer ownership to
     * @dev _fee | Arbitration fee (per disputer) in wei
     * @dev _lapse | Seconds after timelock ends when a Dispute is considered to have "lapsed"
     */
    function init(bytes calldata initParams) external;

    /**
     * @notice If Dispute already exists, returns the fee from when was created. Else, the current fee
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getFee(bytes32 disputeId) external view returns (uint256);

    /**
     * @notice Set a new arbitration fee. Does not affect active Disputes
     * @dev onlyOwner
     * @param _fee New fee in wei
     */
    function setFee(uint256 _fee) external;

    /**
     * @notice Set a new lapse duration. Does not affect active Disputes
     * @dev onlyOwner
     * @param _lapse New lapse in seconds
     */

    function setLapse(uint256 _lapse) external;

    /**
     * @notice Add additional lapse duration to an active dispute
     * @dev onlyOwner
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param extraTime Additional lapse in seconds
     */
    function extendLapse(bytes32 disputeId, uint256 extraTime) external;

    /**
     * @notice True when a dispute has lapsed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function isLapsed(bytes32 disputeId) external view returns (bool);

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
    ) external payable;

    /**
     * @notice Deliver a null arbitration
     * @dev Callable on any active dispute
     * @dev Resets disputes and choices to empty arrays and reimburses disputers
     * @dev onlyOwner
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function arbitrateNull(bytes32 disputeId) external;

    /**
     * @notice Deliver arbitration
     * @dev Callable only when timelock has passed
     * @dev onlyOwner
     * @dev isRequested
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param choice index of the chosen desiredOutcome from dispute.choices
     */
    function arbitrate(bytes32 disputeId, uint256 choice) external;

    /**
     * @notice Delivers arbitration as the Keeper's proposed report and refunds all disputers who requested arbitration
     * @dev Callable when a dispute has lapsed. Also hides this arbitrator in ArbitratorFactory
     * @dev isRequested
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function claimLapse(bytes32 disputeId) external;

    /**
     * @notice Gets timelock of the condition being disputed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getTimelock(bytes32 disputeId)
        external
        view
        returns (uint256 timelock);

    /**
     * @notice Dispute getter
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getDispute(bytes32 disputeId) external view;

    /**
     * @notice Withdraws ETH and reduces balance of msg.sender
     * @dev nonReentrant
     */
    function withdraw() external;

    /**
     * @notice Sets visible=true on ArbitratorFactory's list of arbitrators
     * @dev onlyOwner
     */
    function unhideArbitrator() external;

    /**
     * @notice Sets visible=false on ArbitratorFactory's list of arbitrators
     * @dev onlyOwner
     */
    function hideArbitrator() external;

    /**
     * @notice Increases current owner's balance
     */
    receive() external payable;
}
