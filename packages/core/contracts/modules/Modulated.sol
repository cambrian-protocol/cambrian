// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../interfaces/IModule.sol";
import "../interfaces/ISolver.sol";

abstract contract Modulated {
    address private _context;

    struct Loader {
        IModule module;
        bytes data;
    }

    mapping(address => bool) private modules; // module => true/false

    mapping(bytes32 => bytes) private state;

    function loadModules(Loader[] calldata loaders) internal virtual {
        for (uint256 i; i < loaders.length; i++) {
            modules[address(loaders[i].module)] = true;
            loaders[i].module.load(loaders[i].data);
        }
    }

    function setState(bytes32 key, bytes memory data) external virtual {
        require(isPermittedModule(this.setState.selector), "Not permitted");
        state[key] = data;
    }

    function getState(bytes32 key) public view returns (bytes memory data) {
        data = state[key];
    }

    function isPermittedModule(bytes4 selector) public view returns (bool) {
        if (modules[msg.sender]) {
            bool res = IModule(msg.sender).isPermitted(selector);
            return res;
        } else {
            return false;
        }
    }
}
