// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArbitratorFactory is Ownable {
    bytes4 private constant CLONE_INIT_SELECTOR =
        bytes4(keccak256("init(bytes)"));

    enum Deployability {
        Null,
        Enabled,
        Disabled
    }

    struct Arbitrator {
        address arbitrator;
        address implementation;
    }

    Arbitrator[] public arbitrators; // All arbitrators that have ever been deployed

    address[] public implementations; // All implementations that have ever been allowed

    mapping(address => Deployability) public deployable; // Currently deployable implementations

    event CreatedArbitrator(
        address indexed arbitrator,
        address indexed implementation
    );

    event EnabledImplementation(address indexed implementation);
    event DisabledImplementation(address indexed implementation);

    function enableImplementation(address implementation) external onlyOwner {
        if (deployable[implementation] == Deployability.Null) {
            implementations.push(implementation);
        }

        deployable[implementation] = Deployability.Enabled;

        emit EnabledImplementation(implementation);
    }

    function disableImplementation(address implementation) external onlyOwner {
        deployable[implementation] = Deployability.Disabled;

        emit DisabledImplementation(implementation);
    }

    function createArbitrator(address implementation, bytes calldata initParams)
        external
        returns (address)
    {
        require(
            deployable[implementation] == Deployability.Enabled,
            "ProxyFactory::Invalid implementation address"
        );

        address clone = Clones.clone(implementation);

        bytes memory data = abi.encodeWithSelector(
            CLONE_INIT_SELECTOR,
            initParams
        );
        (bool success, bytes memory retData) = clone.call{value: 0}(data);

        require(success, "Initialization call failed");

        Arbitrator memory arbitrator;
        arbitrator.arbitrator = clone;
        arbitrator.implementation = implementation;

        arbitrators.push(arbitrator);

        emit CreatedArbitrator(clone, implementation);
        return clone;
    }
}
