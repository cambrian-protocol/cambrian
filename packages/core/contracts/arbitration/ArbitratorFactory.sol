// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArbitratorFactory is Ownable {
    bytes4 private constant CLONE_INIT_SELECTOR =
        bytes4(keccak256("init(bytes)"));

    struct Arbitrator {
        uint256 index;
        address arbitrator;
        address implementation;
    }

    Arbitrator[] public arbitrators; // All available arbitrators
    address[] public implementations; // All implementations that have ever been allowed

    mapping(address => Arbitrator) public address_to_arbitrator;

    event CreatedArbitrator(
        address indexed arbitrator,
        address indexed implementation
    );

    /**
     * @notice Deploys a clone of an implementation and initializes it
     * @param implementation Address of the implementation contract
     * @param initParams Params for the initializer function of the implementation
     */
    function createArbitrator(address implementation, bytes calldata initParams)
        external
        returns (address)
    {
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
        arbitrator.index = arbitrators.length; // Array index for new arbitrator

        // Add to arbitrators array and map
        arbitrators.push(arbitrator);
        address_to_arbitrator[clone] = arbitrator;

        emit CreatedArbitrator(clone, implementation);
        return clone;
    }
}
