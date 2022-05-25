// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IModule is IERC165 {
    function load(bytes calldata data) external;

    function fetchPermits() external view returns (bytes4[] memory);

    function isPermitted(bytes4 selector) external view returns (bool);
}
