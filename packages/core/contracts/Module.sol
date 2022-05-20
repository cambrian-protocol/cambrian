// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./interfaces/IModule.sol";

abstract contract Module is IModule {
    event LoadedModule(address indexed module, address indexed solver);

    function viewPermits()
        external
        view
        virtual
        returns (bytes4[] memory allPermits)
    {}

    function isPermitted(bytes4 selector) external view virtual returns (bool) {
        return false;
    }

    function load(bytes calldata data) external virtual {
        emit LoadedModule(address(this), msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(Module).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
