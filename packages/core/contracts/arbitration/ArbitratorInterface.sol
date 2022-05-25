// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.13;

import "../interfaces/ISolver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract ArbitratorInterface is ERC165 {
    function requestArbitration(
        ISolver solver,
        uint256 conditionIndex,
        uint256[] calldata desiredOutcome
    ) external payable virtual;

    function arbitrateNull(bytes32 disputeId) external virtual;

    function arbitrate(bytes32 disputeId, uint256 choice) external virtual;

    function calculateInterface() public pure returns (bytes4) {
        return
            this.requestArbitration.selector ^
            this.arbitrateNull.selector ^
            this.arbitrate.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return
            interfaceId == this.supportsInterface.selector ||
            interfaceId == calculateInterface();
    }
}
