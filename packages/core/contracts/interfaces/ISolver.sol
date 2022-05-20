pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../conditionalTokens/ConditionalTokens.sol";
import "../solvers/Solver.sol";
import "../solvers/SolverLib.sol";

interface ISolver {
    /**
        @notice Called by SolverFactory when contract is created. Nothing else should ever need to call this
        @dev initializer
        @param _chainParent The address of the Solver above this one in the chain. address(0) if this Solver is first.
        @param _chainIndex The index of this Solver in the chain
        @param _solverConfig The configuration of this Solver
    */
    function init(
        address _deployer,
        address _ctfAddress,
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external;

    /**
        @notice Creates a new condition, associated timelock, and executes ingests for this Solver and any child Solvers
        @param _index Index of the new condition to be created.
    */
    function prepareSolve(uint256 _index) external;

    /**
        @notice Deploys a new Solver as a child
        @param _config Configuration of the child Solver
        @return address
    */
    function deployChild(SolverLib.Config calldata _config)
        external
        returns (address);

    /**
        @notice Mints conditional tokens, allocates them to recipients specified by ingested data, runs arbitrary `postroll()` function and tries to do the same for child Solver
        @dev require(ingestsValid())
        @param _index Index of condition to execute on
     */
    function executeSolve(uint256 _index) external;

    /**
        @notice Verifies that all ingests have been performed for a condition
        @return bool
     */
    function ingestsValid() external view returns (bool);

    /**
        @notice Verifies that all slots corresponding to recipients have been filled before CT allocation
        @param _index Condition index
        @return bool
     */
    function allocationsValid(uint256 _index) external view returns (bool);

    /**
        @notice Allows keeper to manually add data to IngestType.Manual slots after executeIngests
        @dev Only Keeper, only manual slots
        @param _slot Destination slot
        @param _data Data to be added
     */
    function addData(bytes32 _slot, bytes memory _data) external;

    /**
        @notice Get most recent data of a slot
        @param _slot slotId
        @return data
     */
    function getData(bytes32 _slot) external view returns (bytes memory data);

    /**
        @notice Get data for each condition from a slot
        @param _slot slotId
        @return data
     */
    function getAllData(bytes32 _slot)
        external
        view
        returns (bytes[] memory data);

    /**
        @notice Register callback expected by a downstream Solver for some data
        @dev only downstream Solver
        @param _slot Slot being waited on by downstream Solver
        @param _chainIndex Index of the Solver requesting this callback
     */
    function registerOutgoingCallback(bytes32 _slot, uint256 _chainIndex)
        external;

    /**
        @notice Handle upstream Solver making callback and ingest the data
        @dev only upstream Solver
        @param _slot Destination slot for the data being sent
     */
    function handleCallback(bytes32 _slot) external;

    /**
        @notice A simple getter that requires upstream slot ver. == our condition ver.
        @param _slot Slot containing data
        @return data
     */
    function getCallbackOutput(bytes32 _slot)
        external
        view
        returns (bytes memory data);

    /**
        @notice Propose payouts (AKA outcomes) for a condition
        @param _index Index of condition
        @param _payouts Array of uint256 values representing the ratio of the collateral that each outcome can claim. The length of this array must be equal to the outcomeSlotCount
     */
    function proposePayouts(uint256 _index, uint256[] calldata _payouts)
        external;

    /**
        @notice Confirm payouts for condition (reportPayouts to ConditionalTokens contract)
        @param _index Index of condition
     */
    function confirmPayouts(uint256 _index) external;

    /**
        @notice Sets condition.status to ArbitrationRequested.
        @param _index Index of condition
     */
    function arbitrationRequested(uint256 _index) external;

    /**
        @notice Allows arbitrator to unilaterally make a payout report.
        @param _index Index of condition
        @param payouts Array of uint256 values representing the ratio of the collateral that each outcome can claim. The length of this array must be equal to the outcomeSlotCount
     */
    function arbitrate(uint256 _index, uint256[] memory payouts) external;

    /**
        @notice Returns condition.status to OutcomeProposed without a ruling.
        @param _index Index of condition
     */
    function arbitrateNull(uint256 _index) external;

    /**
        @notice Get address for a Solver by its index in the chain
        @param _index Index of Solver
        @return _address
     */
    function addressFromChainIndex(uint256 _index)
        external
        view
        returns (address _address);

    /**
        @notice Get condition
        @param index Index of condition
     */
    function condition(uint256 index)
        external
        view
        returns (SolverLib.Condition memory);

    function getConditions()
        external
        view
        returns (SolverLib.Condition[] memory);

    /**
        @notice Get Solver config
     */
    function getConfig() external view returns (SolverLib.Config memory);

    /**
        @notice Get Keeper address 
    */
    function keeper() external view returns (address);

    /**
        @notice Get Arbitrator address 
    */
    function arbitrator() external view returns (address);

    /**
        @notice set ID that will be passed as data for conditional token transfers
        @param _trackingId bytes32
    */
    function setTrackingId(bytes32 _trackingId) external;

    /**
        @notice Get balance of collateral token on Solver
        @return balance
    */
    function collateralBalance() external view returns (uint256 balance);

    /**
        @notice Basic getter
     */
    function timelocks(uint256 conditionIndex)
        external
        view
        returns (uint256 timelock);

    /**
        @notice Returns recipient addresses for a condition
        @param account address to check
        @param conditionIndex condition to check
        @return bool
     */
    function isRecipient(address account, uint256 conditionIndex)
        external
        view
        returns (bool);

    /**
        @notice Get status of a condition
        @param conditionIndex index of condition
        @return status
     */
    function getStatus(uint256 conditionIndex)
        external
        view
        returns (SolverLib.Status status);

    /**
        @notice Redeems CTs held by this Solver. See ConditionalTokens contract for more info.
        @dev only Keeper
     */
    function redeemPosition(
        IERC20 _collateralToken,
        bytes32 _parentCollectionId,
        bytes32 _conditionId,
        uint256[] calldata _indexSets
    ) external;

    function hasRole(bytes32 role, address account)
        external
        view
        returns (bool);

    function setState(bytes32 key, bytes calldata data) external;

    function getState(bytes32 key) external view returns (bytes memory data);
}
