pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./SolverFactory.sol";

contract ProposalsHub {
    struct solverConfig {
        SolverFactory factory;
        address keeper;
        address arbiter;
        bytes32 questionId;
        bytes32 parentCollectionId;
        uint256[] partition;
        address[][] partitionAddresses;
        uint256[][] partitionAmounts;
        uint256 outcomeSlots;
        uint256 amount;
        uint256 timelockDurationHours;
        bytes data;
    }

    struct proposal {
        address collateralToken;
        address keeper;
        uint256 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
        mapping(address => uint256) funderAmount;
        solverConfig[] solverConfigs;
    }

    mapping(bytes32 => proposal) public proposals;

    mapping(bytes32 => address) public proposalSolvers;

    function initiateSolution(bytes32 _proposalId) external {
        for (uint256 i; i < proposals[_proposalId].solverConfigs.length; i++) {
            SolverFactory _factory = proposals[_proposalId]
            .solverConfigs[i]
            .factory;

            _factory.createSolver(
                proposals[_proposalId].solverConfigs[i].keeper,
                proposals[_proposalId].solverConfigs[i].arbiter,
                proposals[_proposalId].solverConfigs[i].parentCollectionId,
                proposals[_proposalId].solverConfigs[i].partition,
                proposals[_proposalId].solverConfigs[i].partitionAddresses,
                proposals[_proposalId].solverConfigs[i].partitionAmounts,
                proposals[_proposalId].solverConfigs[i].outcomeSlots,
                proposals[_proposalId].solverConfigs[i].amount,
                proposals[_proposalId].solverConfigs[i].timelockDurationHours,
                proposals[_proposalId].solverConfigs[i].data
            );
        }
    }

    function fundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].collateralToken == address(_token),
            "Proposal does not include this token to be funded"
        );
        require(_amount > 0, "Amount cannot be zero");

        proposals[_proposalId].funding += _amount;
        proposals[_proposalId].funderAmount[msg.sender] += _amount;
        _token.transferFrom(msg.sender, address(this), _amount);
    }

    function defundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].collateralToken == address(_token),
            "Proposal does not include this token to be funded"
        );
        require(_amount > 0, "Amount cannot be zero");
        require(
            _amount <= proposals[_proposalId].funderAmount[msg.sender],
            "Committed funds is lower than amount."
        );

        proposals[_proposalId].funding -= _amount;
        proposals[_proposalId].funderAmount[msg.sender] -= _amount;

        _token.transferFrom(address(this), msg.sender, _amount);
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
