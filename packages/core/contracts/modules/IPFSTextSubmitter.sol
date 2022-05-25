// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "../solvers/SolverLib.sol";
import "../interfaces/ISolver.sol";
import "./Module.sol";

contract IPFSTextSubmitter is Module {
    event SubmittedWork(
        string cid,
        address submitter,
        bytes32 indexed conditionId
    );

    function load(bytes memory data) external override {
        ISolver(msg.sender).setState(STATEKEY, data);

        emit LoadedModule(address(this), msg.sender);
    }

    function submitter(ISolver solver) public view returns (address) {
        return
            abi.decode(
                solver.getData(bytes32(solver.getState(STATEKEY))),
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
