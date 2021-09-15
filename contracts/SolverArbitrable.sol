/**
 * SPDX-License-Identifier: MIT
 */

import "./interfaces/IArbitrable.sol";

pragma solidity 0.8.0;

contract IArbitrableAdapter is IArbitrable {
    enum Status {Initial, Raised, Disputed, Solved}

    struct Dispute {
        address solver;
        address raiser;
        address disputer;
        uint256 choices;
        uint256 value;
        Status status;
    }

    mapping(uint256 => Dispute) disputes;

    function requestArbitration(address _arbitrator, address _from,  bytes32 questionId, uint256[] memory _requestedPayouts) external payable {
        uint256 disputeID = uint256(keccak256(abi.encodePacked(msg.sender)))
        if (disputes[_disputeID])
    }

    function rule(uint256 _disputeID, uint256 _ruling) external override {}
}
