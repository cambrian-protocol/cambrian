// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../conditionalTokens/ConditionalTokens.sol";

contract ERC1155Rescue is ERC1155Receiver {
    using SafeERC20 for IERC20;

    ConditionalTokens ctf;

    struct Bag {
        bool rescued;
        address recipient;
        bytes32 id;
        bytes32 trackingId;
        uint256[] tokens;
        uint256[] amounts;
    }

    mapping(bytes32 => Bag) bags;

    event ReceivedBag(
        bytes32 indexed id,
        address indexed recipient,
        uint256[] tokenIds,
        uint256[] amounts
    );

    event RescuedBag(
        bytes32 indexed id,
        address indexed to,
        uint256[] tokenIds,
        uint256[] amounts
    );

    constructor(ConditionalTokens _ctf) {
        ctf = _ctf;
    }

    function rescueBag(bytes32 bagId, address to) external {
        Bag storage bag = bags[bagId];
        require(
            msg.sender == bag.recipient,
            "ERC1155Rescue::Only OG recipient"
        );
        require(bag.id == bagId, "ERC1155Rescue::Invalid bagId");
        require(bag.rescued == false, "ERC1155Rescue::Rescued");

        bag.rescued = true;

        ctf.safeBatchTransferFrom(
            address(this),
            to,
            bag.tokens,
            bag.amounts,
            abi.encode(bag.trackingId)
        );

        emit RescuedBag(bagId, to, bag.tokens, bag.amounts);
    }

    function getBagId(
        address solver,
        uint256[] calldata tokenIds,
        uint256[] calldata tokenAmounts
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(solver, tokenIds, tokenAmounts));
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        // Should only receive batch transfers from solver during `executeSolve`
        require(operator == from, "ERC1155Rescue::operator != from");
        bytes32 bagId = getBagId(from, ids, values);

        Bag storage bag = bags[bagId];
        require(bag.id != bagId, "ERC1155Rescue::Bag already exists");

        bag.id = bagId;
        bag.tokens = ids;
        bag.amounts = values;

        (bag.recipient, bag.trackingId) = abi.decode(data, (address, bytes32));

        emit ReceivedBag(bagId, bag.recipient, ids, values);

        return this.onERC1155BatchReceived.selector;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        operator;
        from;
        id;
        value;
        data;
        revert();
    }
}
