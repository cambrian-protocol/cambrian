// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IConditionalTokens.sol";
import "../interfaces/ISolver.sol";

import "../interfaces/ISolver.sol";
import "../solvers/SolverLib.sol";

import "../Module.sol";
import "./Keeper.sol";

abstract contract DefaultProposer is Keeper {
    struct Keep {
        address keeper;
        uint256[] defaultPropose;
    }

    Keep[] public keeps;

    mapping(address => uint256) solver_to_keepIndex;

    function load(bytes calldata data) external override {
        Keep memory keep;
        (keep.keeper, keep.defaultPropose) = abi.decode(
            data,
            (address, uint256[])
        );
        solver_to_keepIndex[msg.sender] = keeps.length;
        keeps.push(keep);
    }

    function roles()
        public
        pure
        override
        returns (bytes32[] memory requestedRoles)
    {
        requestedRoles[0] = keccak256("KEEPER_ROLE");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            interfaceId == type(DefaultProposer).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
