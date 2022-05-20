// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IModule is IERC165 {
    function load(bytes calldata data) external;

    function roles() external pure returns (bytes32[] memory requestedRoles);
}
