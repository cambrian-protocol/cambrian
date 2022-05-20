// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "../solvers/SolverLib.sol";
import "../interfaces/ISolver.sol";
import "../Module.sol";

contract IPFSTextSubmitter is Module {
    bytes32 immutable SUBMITTER_SLOT_KEY;

    event SubmittedWork(string cid, address submitter, bytes32 conditionId);

    constructor() {
        SUBMITTER_SLOT_KEY = keccak256(
            abi.encode(address(this), "SUBMITTER_SLOT")
        );
    }

    function load(bytes calldata data) external override {
        ISolver(msg.sender).setState(SUBMITTER_SLOT_KEY, data);
    }

    function roles()
        external
        pure
        override
        returns (bytes32[] memory requestedRoles)
    {
        return requestedRoles;
    }

    function submitter(ISolver solver) public view returns (address) {
        return abi.decode(solver.getState(SUBMITTER_SLOT_KEY), (address));
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
