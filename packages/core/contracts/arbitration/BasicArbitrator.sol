// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.13;

import "../interfaces/ISolver.sol";
import "../interfaces/IArbitratorFactory.sol";
import "../solvers/SolverLib.sol";
import "../modules/arbitration/Arbitrator.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BasicArbitrator is
    Arbitrator,
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard
{
    struct Dispute {
        ISolver solver;
        uint256 conditionIndex;
        uint256 fee;
        uint256 lapse;
        bytes32 id;
        address[] disputers;
        uint256[][] choices;
    }

    IArbitratorFactory private arbitratorFactory; // Set during init

    uint256 public fee; // wei
    uint256 public lapse; // Seconds after timelock ends when a Dispute is considered to have "lapsed"

    mapping(address => uint256) public balances;
    mapping(bytes32 => Dispute) private disputes; // keccak256(abi.encode(address solver, conditionIndex)) => Dispute

    event Withdrawal(address indexed to, uint256 amount);

    modifier isRequested(bytes32 disputeId) {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != bytes32(""), "Invalid Dispute");

        require(
            dispute.solver.getStatus(dispute.conditionIndex) ==
                SolverLib.Status.ArbitrationRequested,
            "Arbitration not requested"
        );
        _;
    }

    // Recommended disabling of initializers on implementation contract. Not called by clones.
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets fee and immediately transfers ownership to _newOwner
     * @param initParams bytearray of init parameters
     * @dev initializer
     * @dev _newOwner | Address to immediately transfer ownership to
     * @dev _fee | Arbitration fee (per disputer) in wei
     * @dev _lapse | Seconds after timelock ends when a Dispute is considered to have "lapsed"
     */
    function init(bytes calldata initParams) external initializer {
        (address _newOwner, uint256 _fee, uint256 _lapse) = abi.decode(
            initParams,
            (address, uint256, uint256)
        );
        arbitratorFactory = IArbitratorFactory(msg.sender);
        fee = _fee;
        lapse = _lapse;

        __Ownable_init();
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
     * @notice Set a new lapse duration. Does not affect active Disputes
     * @dev onlyOwner
     * @param _lapse New lapse in seconds
     */
    function setLapse(uint256 _lapse) external onlyOwner {
        require(_lapse > 0, "Lapse cannot be 0 days");
        lapse = _lapse;
    }

    /**
     * @notice Add additional lapse duration to an active dispute
     * @dev onlyOwner
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param extraTime Additional lapse in seconds
     */
    function extendLapse(bytes32 disputeId, uint256 extraTime)
        external
        onlyOwner
    {
        require(disputes[disputeId].id != bytes32(""), "Invalid dispute");
        disputes[disputeId].lapse += extraTime;
    }

    /**
     * @notice True when a dispute has lapsed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function isLapsed(bytes32 disputeId) public view returns (bool) {
        return
            block.timestamp >
            (disputes[disputeId].lapse + getTimelock(disputeId));
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

        SolverLib.Status status = solver.getStatus(conditionIndex);

        require(
            status == SolverLib.Status.OutcomeProposed ||
                status == SolverLib.Status.ArbitrationRequested,
            "Condition status invalid for arbitration"
        );

        require(
            block.timestamp < solver.timelocks(conditionIndex),
            "Timelock elapsed"
        );

        bytes32 _disputeId = keccak256(abi.encode(solver, conditionIndex));

        require(msg.value >= getFee(_disputeId), "Insufficient fee");
        balances[msg.sender] += msg.value - fee; // Refund the difference to msg.sender's balance

        Dispute storage dispute = disputes[_disputeId];

        // Create Dispute if it doesn't exist
        if (dispute.id == bytes32("")) {
            dispute.id = _disputeId;
            dispute.solver = solver;
            dispute.conditionIndex = conditionIndex;
            dispute.fee = fee;
            dispute.lapse = lapse;

            // First Disputer is the Keeper
            dispute.disputers.push(solver.keeper());

            //  First Choice is the disputed payouts
            SolverLib.Condition memory condition = solver.condition(
                conditionIndex
            );
            dispute.choices.push(condition.payouts);
        }

        dispute.disputers.push(msg.sender);
        dispute.choices.push(desiredOutcome);
        solver.requestArbitration(conditionIndex);
    }

    /**
     * @notice Deliver a null arbitration. Resets disputes and choices to empty arrays and reimburses disputers
     * @dev Callable on any active dispute
     * @dev onlyOwner
     * @dev isRequested
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function arbitrateNull(bytes32 disputeId)
        external
        onlyOwner
        isRequested(disputeId)
    {
        Dispute storage dispute = disputes[disputeId];

        dispute.solver.arbitrateNull(dispute.conditionIndex);

        reimburse(disputeId);

        // Delete disputers & choices (AFTER reimburse)
        delete dispute.disputers;
        delete dispute.choices;
    }

    /**
     * @notice Deliver arbitration
     * @dev Callable only when timelock has passed
     * @dev onlyOwner
     * @dev isRequested
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
     * @notice Delivers arbitration as the Keeper's proposed report and refunds all disputers who requested arbitration
     * @dev Callable when a dispute has lapsed. Also hides this arbitrator in ArbitratorFactory
     * @dev isRequested
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function claimLapse(bytes32 disputeId) external isRequested(disputeId) {
        Dispute memory dispute = disputes[disputeId];

        require(isLapsed(disputeId), "Not lapsed");

        SolverLib.Condition memory condition = disputes[disputeId]
            .solver
            .condition(dispute.conditionIndex);

        dispute.solver.arbitrate(dispute.conditionIndex, condition.payouts);
        reimburse(disputeId);
        _hideArbitrator();
    }

    /**
     * @notice Adds withdrawal balance to the arbitrator and disputers whose choice matched the arbitrator's ruling
     * @dev Arbitrator must select from disputed choices
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     * @param choice index of the chosen desiredOutcome from dispute.choices
     */
    function imburse(bytes32 disputeId, uint256 choice) private {
        Dispute storage dispute = disputes[disputeId];

        // Skip first disputer/choice, they are automatically the Keeper/proposed payouts
        uint256 remainingFee = dispute.fee * (dispute.disputers.length - 1);
        for (uint256 i = 1; i < dispute.disputers.length; i++) {
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
     * @notice Adds withdrawal balance to all disputers
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function reimburse(bytes32 disputeId) private {
        Dispute storage dispute = disputes[disputeId];

        // Skip first disputer/choice, they are automatically the Keeper/proposed payouts
        for (uint256 i = 1; i < dispute.disputers.length; i++) {
            balances[dispute.disputers[i]] += dispute.fee;
        }
    }

    /**
     * @notice Gets timelock of the condition being disputed
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getTimelock(bytes32 disputeId)
        public
        view
        returns (uint256 timelock)
    {
        timelock = disputes[disputeId].solver.timelocks(
            disputes[disputeId].conditionIndex
        );
    }

    /**
     * @notice Dispute getter
     * @param disputeId keccak256(abi.encode(address solver, uint256 conditionId))
     */
    function getDispute(bytes32 disputeId)
        public
        view
        returns (Dispute memory dispute)
    {
        dispute = disputes[disputeId];
    }

    /**
     * @notice Withdraws ETH and reduces balance of msg.sender
     * @dev nonReentrant
     */
    function withdraw() external nonReentrant {
        require(balances[msg.sender] > 0, "No balance");
        uint256 balance = balances[msg.sender];
        balances[msg.sender] -= balance;
        (bool success, bytes memory ret) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, balance);
    }

    /**
     * @notice Sets visible=true on ArbitratorFactory's list of arbitrators
     * @dev onlyOwner
     */
    function unhideArbitrator() external onlyOwner {
        arbitratorFactory.unhideArbitrator();
    }

    /**
     * @notice Sets visible=false on ArbitratorFactory's list of arbitrators
     * @dev onlyOwner
     */
    function hideArbitrator() external onlyOwner {
        _hideArbitrator();
    }

    /**
     * @notice Sets visible=false on ArbitratorFactory's list of arbitrators
     * @dev Called by owner through hideArbitrator() or automatically by claimlapse()
     */
    function _hideArbitrator() internal {
        arbitratorFactory.hideArbitrator();
    }

    /**
     * @notice Increases current owner's balance
     */
    receive() external payable {
        balances[owner()] += msg.value;
    }
}
