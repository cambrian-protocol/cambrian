/**
 * SPDX-License-Identifier: MIT
 */

pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./interfaces/IArbitrator.sol";

/**
 * @title Arbitrator
 * Arbitrator abstract contract.
 * When developing arbitrator contracts we need to:
 * - Define the functions for dispute creation (createDispute) and appeal (appeal). Don't forget to store the arbitrated contract and the disputeID (which should be unique, may nbDisputes).
 * - Define the functions for cost display (arbitrationCost and appealCost).
 * - Allow giving rulings. For this a function must call arbitrable.rule(disputeID, ruling).
 */
contract ERC729CentralizedArbitrator is IArbitrator, Ownable {
    struct Dispute {
        IArbitrable arbitrated;
        uint256 choices;
        uint256 ruling;
        DisputeStatus status;
    }

    uint256 arbitrationFee = 0.1 ether; // Arbitrary
    uint256 appealFee = type(uint256).max; // Huge to effectively avoid appeals

    mapping(uint256 => Dispute) disputes;

    /**
     * @dev Compute the cost of arbitration. It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
     * @param _extraData Can be used to give additional info on the dispute to be created.
     * @return cost Amount to be paid.
     */
    function arbitrationCost(bytes memory _extraData)
        public
        view
        override
        returns (uint256 cost)
    {
        return arbitrationFee;
    }

    /**
     * @dev Compute the cost of appeal. It is recommended not to increase it often, as it can be higly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
     * @param _disputeID ID of the dispute to be appealed.
     * @param _extraData Can be used to give additional info on the dispute to be created.
     * @return cost Amount to be paid.
     */
    function appealCost(uint256 _disputeID, bytes memory _extraData)
        public
        view
        override
        returns (uint256 cost)
    {
        return appealFee;
    }

    function updateArbitrationFee(uint256 _wei) external onlyOwner {
        arbitrationFee = _wei;
    }

    function updateAppealFee(uint256 _wei) external onlyOwner {
        appealFee = _wei;
    }

    /**
     * @dev Create a dispute. Must be called by the arbitrable contract.
     * Must be paid at least arbitrationCost(_extraData).
     * @param _choices Amount of choices the arbitrator can make in this dispute.
     * @param _extraData Can be used to give additional info on the dispute to be created.
     * @return disputeID ID of the dispute created.
     */
    function createDispute(uint256 _choices, bytes calldata _extraData)
        external
        payable
        override
        returns (uint256 disputeID)
    {
        require(
            msg.value >= arbitrationCost(_extraData),
            "Not enough ETH to cover arbitration costs."
        );

        uint256 _disputeID = BytesLib.toUint256(_extraData, 0);
        disputes[_disputeID] = Dispute({
            arbitrated: IArbitrable(msg.sender),
            choices: _choices,
            ruling: type(uint256).max,
            status: DisputeStatus.Waiting
        });

        return _disputeID;
    }

    /**
     * @dev Appeal a ruling. Note that it has to be called before the arbitrator contract calls rule.
     * @param _disputeID ID of the dispute to be appealed.
     * @param _extraData Can be used to give extra info on the appeal.
     */
    function appeal(uint256 _disputeID, bytes calldata _extraData)
        external
        payable
        override
    {
        require(
            msg.value >= appealCost(_disputeID, _extraData),
            "Not enough ETH to cover arbitration costs."
        );

        // Deny all appeals
        require(true == false, "Arbitrator::Appeals are disabled");
    }

    /**
     * @dev Compute the start and end of the dispute's current or next appeal period, if possible. If not known or appeal is impossible: should return (0, 0).
     * @param _disputeID ID of the dispute.
     * @return start The start of the period.
     * @return end The end of the period.
     */
    function appealPeriod(uint256 _disputeID)
        external
        pure
        override
        returns (uint256 start, uint256 end)
    {
        return (0, 0);
    }

    /**
     * @dev Return the status of a dispute.
     * @param _disputeID ID of the dispute to rule.
     * @return status The status of the dispute.
     */
    function disputeStatus(uint256 _disputeID)
        external
        view
        override
        returns (DisputeStatus status)
    {
        status = disputes[_disputeID].status;
    }

    /**
     * @dev Return the current ruling of a dispute. This is useful for parties to know if they should appeal.
     * @param _disputeID ID of the dispute.
     * @return ruling The ruling which has been given or the one which will be given if there is no appeal.
     */
    function currentRuling(uint256 _disputeID)
        external
        view
        override
        returns (uint256 ruling)
    {
        ruling = disputes[_disputeID].ruling;
    }

    function rule(uint256 _disputeID, uint256 _ruling) public onlyOwner {
        Dispute storage dispute = disputes[_disputeID];

        require(_ruling <= dispute.choices, "Ruling out of bounds!");
        require(
            dispute.status == DisputeStatus.Waiting,
            "Dispute is not awaiting arbitration."
        );

        dispute.ruling = _ruling;
        dispute.status = DisputeStatus.Solved;

        (bool sent, bytes memory retData) = owner().call{
            value: arbitrationCost(bytes(""))
        }("");

        require(sent, "Arbitrator::Ether send failed");
        dispute.arbitrated.rule(_disputeID, _ruling);
    }
}
