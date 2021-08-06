pragma solidity 0.8.0;

contract Minion {
    struct Action {
        uint256 value;
        address to;
        bool executed;
        bytes data;
    }
}
