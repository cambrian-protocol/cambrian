// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.13;

import "../interfaces/ISolver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**

How to Detect if a Contract Implements ERC-165

The source contract makes a STATICCALL to the destination address with input data: 0x01ffc9a701ffc9a700000000000000000000000000000000000000000000000000000000 and gas 30,000. This corresponds to contract.supportsInterface(0x01ffc9a7).

If the call fails or return false, the destination contract does not implement ERC-165.

If the call returns true, a second call is made with input data 0x01ffc9a7ffffffff00000000000000000000000000000000000000000000000000000000.

If the second call fails or returns true, the destination contract does not implement ERC-165.

Otherwise it implements ERC-165.

*/

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
