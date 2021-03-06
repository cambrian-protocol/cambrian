// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.14;

import "../interfaces/ISolver.sol";

contract ArbitrationDispatch {
    bool internal locked;
    modifier reentrancyGuard() {
        require(!locked, "reentrancyGuard");
        locked = true;
        _;
        locked = false;
    }

    event RequestedArbitration(
        address indexed solver,
        address indexed arbitrator,
        address requester,
        uint256 conditionIndex,
        uint256 value,
        bytes retData
    );

    /**
     * @notice Atomically forwards ETH (may be zero) to arbitrator address.
     * @dev Untrusted
     * @param solver Address of solver
     * @param conditionIndex Index of condition for which arbitration is being requested
     */
    function requestArbitration(ISolver solver, uint256 conditionIndex)
        external
        payable
        reentrancyGuard
    {
        address _arbitrator = solver.arbitrator();
        require(_arbitrator != address(0), "Arbitrator can't be zero address");

        SolverLib.Condition memory condition = solver.condition(conditionIndex);

        require(
            condition.status == SolverLib.Status.OutcomeProposed ||
                condition.status == SolverLib.Status.ArbitrationRequested,
            "Condition status invalid for arbitration"
        );

        (bool success, bytes memory retData) = _arbitrator.call{
            value: msg.value
        }(abi.encode(address(solver), conditionIndex, msg.sender));

        require(success, "Arbitrator reverted");

        emit RequestedArbitration(
            address(solver),
            _arbitrator,
            msg.sender,
            conditionIndex,
            msg.value,
            retData
        );
    }
}
