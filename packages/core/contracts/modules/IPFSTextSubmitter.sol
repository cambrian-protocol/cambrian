// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "../solvers/SolverLib.sol";
import "../interfaces/ISolver.sol";
import "../Module.sol";

import "hardhat/console.sol";

contract IPFSTextSubmitter is Module {
    bytes32 constant SOLVER_ROLE = keccak256("SOLVER_ROLE");
    bytes32 public immutable SUBMITTER_SLOT_STATE_KEY;

    event SubmittedWork(string cid, address submitter, bytes32 conditionId);

    constructor() {
        SUBMITTER_SLOT_STATE_KEY = keccak256(
            abi.encode(address(this), "SUBMITTER_SLOT_STATE_KEY")
        );
    }

    function load(bytes memory data) external override {
        ISolver(msg.sender).setState(SUBMITTER_SLOT_STATE_KEY, data);

        emit LoadedModule(address(this), msg.sender);
    }

    function roles()
        public
        pure
        override
        returns (bytes32[] memory requestedRoles)
    {
        requestedRoles = new bytes32[](1);
        requestedRoles[0] = SOLVER_ROLE;
    }

    function submitter(ISolver solver) public view returns (address) {
        return
            abi.decode(
                solver.getData(
                    bytes32(solver.getState(SUBMITTER_SLOT_STATE_KEY))
                ),
                (address)
            );
    }

    function submit(
        ISolver solver,
        string calldata cid,
        uint256 conditionIndex
    ) external {
        require(msg.sender == submitter(solver), "Only Submitter");
        SolverLib.Condition memory condition = solver.condition(conditionIndex);

        require(condition.status == SolverLib.Status.Executed, "Disabled");
        emit SubmittedWork(cid, msg.sender, condition.conditionId);
    }
}
