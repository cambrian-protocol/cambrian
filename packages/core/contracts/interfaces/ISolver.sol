pragma solidity 0.8.0;

import "../ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Solver.sol";
import "../SolverLib.sol";

interface ISolver {
    // INITIALIZATION - Only called by SolverFactory
    function init(
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external;

    // PREP AND EXECUTE

    function prepareSolve(uint256 _index) external;

    function deployChild(SolverLib.Config calldata _config)
        external
        returns (Solver _solver);

    function executeSolve(uint256 _index) external;

    // DATA

    function addData(bytes32 _slot, bytes memory _data) external;

    function getData(bytes32 _slot) external view returns (bytes memory data);

    // CALLBACKS

    function registerOutgoingCallback(bytes32 _slot, uint256 _chainIndex)
        external;

    function handleCallback(bytes32 _slot) external;

    function getCallbackOutput(bytes32 _slot)
        external
        view
        returns (bytes memory data);

    function getOutgoingCallbacks(uint256 slot)
        external
        view
        returns (address[] memory);

    // REPORTING

    function proposePayouts(uint256 _index, uint256[] calldata _payouts)
        external;

    function confirmPayouts(uint256 _index) external;

    // ARBITRATION

    function arbitrate(uint256 _index, uint256[] calldata _payouts) external;

    function nullArbitrate(uint256 _index) external;

    function arbitrationRequested(uint256 _index) external;

    function arbitrationPending(uint256 _index) external;

    // UTILITY

    function ingestsValid() external view returns (bool);

    function allocationsValid(uint256 _index) external view returns (bool);

    function addressFromChainIndex(uint256 _index)
        external
        view
        returns (address _address);

    function setTrackingId(bytes32 _trackingId) external;

    function getConditions()
        external
        view
        returns (SolverLib.Condition[] memory);

    function conditions(uint256 index)
        external
        view
        returns (SolverLib.Condition memory);

    function arbitrator() external view returns (address);

    function collateralBalance() external view returns (uint256 balance);

    function redeemPosition(
        IERC20 _collateralToken,
        bytes32 _parentCollectionId,
        bytes32 _conditionId,
        uint256[] calldata _indexSets
    ) external;
}
