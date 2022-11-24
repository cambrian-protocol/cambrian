// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Solver.t.sol";

contract IndexSetsTest is SolverTest {
    function testIndex(uint256[] calldata indexSets) public {
        // uint256[] memory _indexSets = new uint256[](2);
        // _indexSets[0] = 1;
        // _indexSets[1] = 2;

        SolverLib.Condition[] memory conditions = solvers[0].getConditions();

        vm.prank(seller);
        vm.recordLogs();
        try ctf.redeemPositions(IERC20(address(toyToken)), bytes32(uint256(0)), conditions[conditions.length-1].conditionId, indexSets) {
            Vm.Log[] memory entries = vm.getRecordedLogs();
            (bytes32 _logConditionId, uint256[] memory _logIndexSets, uint256 logPayout) = abi.decode(entries[entries.length-1].data, (bytes32, uint256[], uint256));
            //assertEq(logPayout, 100);
            require(toyToken.balanceOf(seller) == logPayout, "seller balance should be 100");
        } catch {
            require(toyToken.balanceOf(seller) == 0, "redeemPositions failed, seller balance should be 0");
        }

    }
}