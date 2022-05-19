// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.13;

import "../interfaces/ISolver.sol";
import "../Module.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract Arbitrator is Module {
    function requestArbitration(
        ISolver solver,
        uint256 conditionIndex,
        uint256[] calldata desiredOutcome
    ) external payable virtual;

    function arbitrateNull(bytes32 disputeId) external virtual;

    function arbitrate(bytes32 disputeId, uint256 choice) external virtual;

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(Arbitrator).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
