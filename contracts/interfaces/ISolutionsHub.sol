pragma solidity 0.8.0;

interface ISolutionsHub {
    function getSolution(bytes32 _id) external view;

    function solverFromIndex(bytes32 _solutionId, uint256 _solverIndex)
        external
        view
        returns (address solver);
}
