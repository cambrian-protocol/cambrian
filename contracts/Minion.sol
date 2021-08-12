pragma solidity 0.8.0;

contract Minion {
    struct Action {
        address to;
        bool executed;
        bool useSolverIdx;
        uint256 solverIdx;
        uint256 value;
        bytes data;
    }
}
