// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../../interfaces/ISolver.sol";

import "../../solvers/SolverLib.sol";

import "../Module.sol";

contract Unanimity is Module {
    constructor() {
        permits.push(ISolver.setTimelock.selector);
    }

    function load(bytes calldata data) external override {
        ISolver(msg.sender).setState(
            STATEKEY,
            abi.encode(getNumUniqueRecipients(ISolver(msg.sender)))
        );
        emit LoadedModule(address(this), msg.sender);
    }

    function approveOutcome(ISolver solver, uint256 conditionIndex)
        external
        returns (address[] memory approved)
    {
        require(
            solver.isRecipient(msg.sender, conditionIndex),
            "Only recipients"
        );
        require(
            solver.getStatus(conditionIndex) ==
                SolverLib.Status.OutcomeProposed,
            "Not proposes"
        );

        uint256 numRecipients = abi.decode(
            solver.getState(STATEKEY),
            (uint256)
        );

        bytes32 APPROVERS_STATEKEY = keccak256(
            abi.encode(STATEKEY, "APPROVERS_STATEKEY", conditionIndex)
        );

        address[] memory approvers;

        bytes memory approverData = solver.getState(APPROVERS_STATEKEY);

        if (approverData.length > 0) {
            approvers = abi.decode(approverData, (address[]));
        }

        for (uint256 i = 0; i < approvers.length; i++) {
            if (msg.sender == approvers[i]) {
                revert("Already approved");
            }
        }

        if (approvers.length + 1 == numRecipients) {
            solver.setTimelock(conditionIndex, 0);
            solver.confirmPayouts(conditionIndex);
        } else {
            address[] memory newApprovers = new address[](approvers.length + 1);
            for (uint256 i = 0; i < approvers.length; i++) {
                newApprovers[i] = approvers[i];
            }
            newApprovers[approvers.length] = msg.sender;
            solver.setState(APPROVERS_STATEKEY, abi.encode(newApprovers));
        }

        return approvers;
    }

    function getNumUniqueRecipients(ISolver solver)
        public
        view
        returns (uint256)
    {
        SolverLib.Config memory config = solver.getConfig();

        bytes32[] memory recipientSlots = new bytes32[](
            config.conditionBase.allocations.length
        );

        uint256 numDuplicates = 0;

        for (uint256 i = 0; i < config.conditionBase.allocations.length; i++) {
            bool duplicate = false;

            for (uint256 j = 0; j < recipientSlots.length; j++) {
                if (
                    recipientSlots[j] ==
                    config.conditionBase.allocations[i].recipientAddressSlot
                ) {
                    duplicate = true;
                }
            }

            if (!duplicate) {
                recipientSlots[i - numDuplicates] = (
                    config.conditionBase.allocations[i].recipientAddressSlot
                );
            } else {
                numDuplicates++;
            }
        }

        return recipientSlots.length - numDuplicates;
    }
}
