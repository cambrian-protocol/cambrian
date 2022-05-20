// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract Module is ERC165 {
    function load(bytes calldata data) external virtual;

    function roles()
        external
        pure
        virtual
        returns (bytes32[] memory requestedRoles);

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(Module).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
