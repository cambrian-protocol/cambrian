// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./Solver.sol";

contract SolverFactory is Ownable {
    Solver[] public solverAddresses;
    mapping(address => Solver) solverMap;

    event SolverCreated(Solver solver);

    function createSolver(
        address _keeper,
        address _arbiter,
        bytes32 _parentCollectionId,
        uint256[] memory _partition,
        address[][] memory _partitionAddresses,
        uint256[][] memory _partitionAmounts,
        uint256 _outcomeSlots,
        uint256 _amount,
        uint256 _timelockDurationHours,
        bytes memory _data
    ) external returns (address _solver) {
        Solver solver = new Solver(
            _keeper,
            _arbiter,
            _parentCollectionId,
            _partition,
            _partitionAddresses,
            _partitionAmounts,
            _outcomeSlots,
            _amount,
            _timelockDurationHours,
            _data
        );

        solverAddresses.push(solver);
        solverMap[address(solver)] = solver;
        emit SolverCreated(solver);

        return address(solver);
    }
}
