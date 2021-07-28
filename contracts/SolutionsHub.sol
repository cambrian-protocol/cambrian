pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SolutionsHub {
    struct solution {
        bytes32 id;
        address[] solvers;
        address[] keepers;
        bytes32[] datas;
        bytes32[][] questionIds;
        uint256[][] positionSlotCounts;
        uint256[][] amounts;
        uint256[][] indexSets;
        address[][] addresses;
    }

    mapping(bytes32 => solution) solutions;
}
