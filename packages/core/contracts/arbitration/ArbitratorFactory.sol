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
        uint256 index;
        bool visible;
        address arbitrator;
        address implementation;
    }

    Arbitrator[] public arbitrators; // All available arbitrators
    address[] public implementations; // All implementations that have ever been allowed

    mapping(address => Arbitrator) public address_to_arbitrator;
    mapping(address => Deployability) public deployable; // Currently deployable implementations

    event CreatedArbitrator(
        address indexed arbitrator,
        address indexed implementation
    );

    event HidArbitrator(address indexed arbitrator);
    event UnhidArbitrator(address indexed arbitrator);

    event EnabledImplementation(address indexed implementation);
    event DisabledImplementation(address indexed implementation);

    /**
     * @notice Enables an implementation address, allowing clones of it to be deployed as Arbitrators
     * @dev onlyOwner
     * @param implementation Address of the implementation contract
     */
    function enableImplementation(address implementation) external onlyOwner {
        if (deployable[implementation] == Deployability.Null) {
            implementations.push(implementation);
        }

        deployable[implementation] = Deployability.Enabled;

        emit EnabledImplementation(implementation);
    }

    /**
     * @notice Disables an implementation address, preventing clones of it from deploying
     * @dev onlyOwner
     * @param implementation Address of the implementation contract
     */
    function disableImplementation(address implementation) external onlyOwner {
        deployable[implementation] = Deployability.Disabled;

        emit DisabledImplementation(implementation);
    }

    /**
     * @notice Deploys a clone of an implementation and initializes it
     * @param implementation Address of the implementation contract
     * @param initParams Params for the initializer function of the implementation
     */
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
        arbitrator.visible = true;
        arbitrator.index = arbitrators.length; // Array index for new arbitrator

        // Add to arbitrators array and map
        arbitrators.push(arbitrator);
        address_to_arbitrator[clone] = arbitrator;

        emit CreatedArbitrator(clone, implementation);
        return clone;
    }

    /**
     * @notice Sets visibility = false on an arbitrator. Does NOT prevent it from being used, but should not show in any lists of selectable arbitrators
     * @dev Called by an Arbitrator
     */
    function hideArbitrator() external {
        require(
            msg.sender == address_to_arbitrator[msg.sender].arbitrator,
            "Only arbitrator"
        );

        address_to_arbitrator[msg.sender].visible = false;
        arbitrators[address_to_arbitrator[msg.sender].index].visible = false;
        emit HidArbitrator(msg.sender);
    }

    /**
     * @notice Sets visibility = true on an arbitrator. Should show in lists of selectable arbitrators
     * @dev Called by an Arbitrator
     */
    function unhideArbitrator() external {
        require(
            msg.sender == address_to_arbitrator[msg.sender].arbitrator,
            "Only arbitrator"
        );

        address_to_arbitrator[msg.sender].visible = true;
        arbitrators[address_to_arbitrator[msg.sender].index].visible = true;
        emit UnhidArbitrator(msg.sender);
    }
}
