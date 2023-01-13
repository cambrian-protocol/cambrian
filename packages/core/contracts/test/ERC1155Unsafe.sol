// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.14;

import "../interfaces/IERC1155Rescue.sol";

contract ERC1155Unsafe {
    IERC1155Rescue rescue;

    constructor(IERC1155Rescue _rescue) {
        rescue = _rescue;
    }

    function rescueBag(bytes32 bagId, address to) external {
        rescue.rescueBag(bagId, to);
    }
}
