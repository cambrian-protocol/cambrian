pragma solidity ^0.8.0;

import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Local ConditionalTokens address = 0x5FbDB2315678afecb367f032d93F642f64180aa3

contract SimpleSolver {
    ConditionalTokens public conditionalTokens;

    /**
        @dev This struct holds information about a Solvable the Solver is expected to report outcomes to.
        @param id The ID of the Solvable
        @param keeper The Keeper of the Solvable
        @param questionIds An array of questionIds assigned by the Solvable
        @param positionSlotCounts An array of positionSlotCounts which MUST match those expected for the questionIds  
    */
    struct Solvable {
        bytes32 id;
        address keeper;
        bytes32[] questionIds;
        uint256[] positionSlotCounts;
    }

    /**
        @dev This mapping is from a solvableId => Solvable which the Solver is commissioned by
    */
    mapping(bytes32 => Solvable) public solvables;

    constructor() {}

    // MODIFIERS

    modifier onlyKeeper(address keeper) {
        require(msg.sender == keeper);
        _;
    }

    // FUNCTIONS

    /**
        @dev This function is called by a Solution to commission a Solvable the Solver
        @param solvableId The ID of the Solvable commissioning the Solver
        @param keeper The Keeper of the Solvable
        @param questionIds An array of questionIds assigned by the Solvable
        @param positionSlotCounts An array of positionSlotCounts which MUST match those expected for the questionIds  
    */
    function receiveCommission(
        bytes32 solvableId,
        address keeper,
        bytes32[] calldata questionIds,
        uint256[] calldata positionSlotCounts
    ) external {
        Solvable memory _solvable = Solvable(
            solvableId,
            keeper,
            questionIds,
            positionSlotCounts
        );
        solvables[solvableId] = _solvable;
    }

    /**
        @dev This function reports the outcomes of the Solvable
        @param solvableId The ID of the Solvable to be reported on
        @param questionId The ID of the question being reported on
        @param outcomes The outcome array being reported  
    */
    function reportOutcomes(
        bytes32 solvableId,
        bytes32 questionId,
        uint256[] calldata outcomes
    ) external onlyKeeper(solvables[solvableId].keeper) {
        // TODO report outcomes to Solvable
    }

    /**
        @dev See ERC1155Receiver
    */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            );
    }

    /**
        @dev See ERC1155Receiver
    */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"
                )
            );
    }
}
