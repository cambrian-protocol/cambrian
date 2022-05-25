// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "./SolverLib.sol";
import "./Solver.sol";
import "../modules/Module.sol";

contract WriterSolverV1 is Solver, Module {
    bytes32 writerSlot; // TODO replace with state

    event SubmittedWork(string cid, address submitter, bytes32 conditionId);

    function load(bytes calldata data) public override {
        require(msg.sender == address(this), "Only this");
        writerSlot = abi.decode(data, (bytes32));
    }

    function writer() public view returns (address) {
        return abi.decode(getData(writerSlot), (address));
    }

    function submitWork(string calldata cid, bytes32 conditionId) external {
        require(msg.sender == writer(), "Only Writer");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Disabled"
        );
        emit SubmittedWork(cid, msg.sender, conditionId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Receiver, Module)
        returns (bool)
    {
        return
            Module.supportsInterface(interfaceId) ||
            ERC1155Receiver.supportsInterface(interfaceId);
    }
}
