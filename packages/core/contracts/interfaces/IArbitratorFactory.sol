// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IArbitratorFactory {
    function enableImplementation(address implementation) external;

    function disableImplementation(address implementation) external;

    function createArbitrator(address implementation, bytes calldata initParams)
        external;

    function hideArbitrator() external;

    function unhideArbitrator() external;
}
