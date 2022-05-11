// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArbitratorFactory is Ownable {
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

    function createArbitrator(address implementation, bytes memory initCall)
        external
        returns (address)
    {
        require(
            deployable[implementation] == Deployability.Enabled,
            "ProxyFactory::Invalid implementation address"
        );

        address clone = Clones.clone(implementation);

        (bool success, bytes memory retData) = clone.call{value: 0}(initCall);

        require(success, "Initialization call failed");

        emit CreatedArbitrator(clone, implementation);
        return clone;
    }
}
