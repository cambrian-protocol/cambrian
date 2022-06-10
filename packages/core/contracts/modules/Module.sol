// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./Modulated.sol";

import "../interfaces/IModule.sol";

abstract contract Module is IModule {
    bytes4[] permits;
    bytes32 immutable STATEKEY = keccak256(abi.encode(address(this)));

    event LoadedModule(address indexed module, address indexed solver);

    constructor() {
        permits.push(Modulated.setState.selector);
    }

    function fetchPermits() external view returns (bytes4[] memory) {
        return permits;
    }

    function isPermitted(bytes4 selector) external view returns (bool) {
        for (uint256 i = 0; i < permits.length; i++) {
            if (permits[i] == selector) {
                return true;
            }
        }

        return false;
    }

    function load(bytes calldata data) external virtual {
        Modulated(msg.sender).setState(STATEKEY, data);
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
