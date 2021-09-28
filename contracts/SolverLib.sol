// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISolver.sol";
import "./interfaces/IConditionalTokens.sol";
import "./SolverFactory.sol";

library SolverLib {
    struct Action {
        bool executed;
        bool isPort;
        address to;
        uint256 portIndex;
        uint256 value;
        bytes data;
    }

    // Expected sources of data being ingested into the Solver
    struct Ingest {
        uint256 executions; // Number of times this Ingest has been executed
        bool isDeferred; // Data is waiting on an upstream action and must be ingested manually later
        bool isConstant; // Data is supplied directly which cannot change
        uint8 port; // Destination port for data: addressPort || boolPort || bytesPort || bytes32Port || uint256Port
        uint256 key; // Destination key for data
        uint256 solverIndex; // Index of the Solver in the chain to make this call to
        bytes data; // Raw when isConstant=true, else an encoded function call
    }

    // Status state for Conditions
    enum Status {
        Initiated, // Default state
        Executed, // Solver has executed according to configuration
        OutcomeProposed, // Outcome has been proposed for reporting
        ArbitrationRequested, // One party has requested arbitration on this condition
        ArbitrationPending, // An official dispute has been raised and requires arbitration
        ArbitrationDelivered, // Arbitration (except 'null' arbitration) has been delivered for this condition
        OutcomeReported // Outcome has been reported to the CTF via reportPayouts()
    }

    // Condition object created by addCondition() from ConditionBase
    struct Condition {
        IERC20 collateralToken;
        bytes32 questionId; // // keccak256(abi.encodePacked(config.conditionBase.metadata, address(this), conditions.length))
        bytes32 parentCollectionId; // ID of the parent collection above this Solver in the CTF
        bytes32 conditionId; // ID of this condition in the CTF
        uint256[] payouts; // Currently proposed payouts. Final if reported == true
        Status status; // Status of this condition
    }

    // Immutable data regarding conditions which may be created
    struct ConditionBase {
        IERC20 collateralToken;
        uint256 outcomeSlots; // Num outcome slots
        uint256 parentCollectionPartitionIndex; // Index of partition to get parentCollectionId from parent Solver's uint256[] partition
        uint256 amount; // Amount of collateral being used        // TODO maybe make this dynamic also
        uint256[] partition; // Partition of positions for payouts
        uint256[] recipientAddressPorts; // Arrays of [i] for addressPorts[i] containing CT recipients
        uint256[][] recipientAmounts; // Arrays containing amount of CTs to send to each recipient for each partition
        string metadata;
    }

    // Configuration of this Solver
    struct Config {
        Solver implementation; // The implementation address for this Solver
        address keeper; // Keeper address
        address arbitrator; // Arbitrator address
        uint256 timelockSeconds; // Number of seconds to increment timelock for during critical activities
        bytes data; // Arbitrary data
        Ingest[] ingests; // Data ingests to be performed to bring data in from other Solver
        Action[] actions; // Arbitrary actions to be run during execution
        ConditionBase conditionBase; // Base to create conditions from
    }

    enum DataType {
        Address,
        Bool,
        Bytes,
        Bytes32,
        Uint256
    }

    struct Datas {
        mapping(uint256 => bytes) ports;
        mapping(uint256 => uint256) portVersions;
        mapping(uint256 => DataType) portTypes;
    }

    function createCondition(
        ConditionBase calldata base,
        address chainParent,
        address oracle,
        uint256 conditionVer
    ) public returns (Condition memory condition) {
        condition.questionId = keccak256(
            abi.encodePacked(base.metadata, oracle, conditionVer)
        );

        if (chainParent == address(0)) {
            condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            condition.parentCollectionId = Solver(chainParent)
                .getCanonCollectionId(base.parentCollectionPartitionIndex);
        }

        condition.conditionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getConditionId(
                oracle, // Solver is Oracle
                condition.questionId,
                base.outcomeSlots
            );

        condition.collateralToken = base.collateralToken;

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .prepareCondition(oracle, condition.questionId, base.outcomeSlots);
    }

    function ingestsValid(Ingest[] calldata ingests, uint256 conditionVer)
        public
        pure
        returns (bool)
    {
        for (uint256 i; i < ingests.length; i++) {
            if (
                ingests[i].isDeferred && (ingests[i].executions != conditionVer)
            ) {
                return false;
            }
        }

        return true;
    }

    function deployChild(
        Config calldata config,
        address solver,
        uint256 solverIndex
    ) public returns (address child, Solver) {
        child = SolverFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
            .createSolver(solver, solverIndex + 1, config);

        return (child, Solver(child));
    }

    function getPositionId(
        Condition memory condition,
        IERC20 collateralToken,
        uint256 partition
    ) public view returns (uint256 positionId) {
        IConditionalTokens ct = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        );
        positionId = ct.getPositionId(
            collateralToken,
            ct.getCollectionId(
                condition.parentCollectionId,
                condition.conditionId,
                partition
            )
        );
    }

    function splitPosition(
        address chainParent,
        ConditionBase calldata base,
        Condition calldata condition
    ) public {
        if (chainParent == address(0)) {
            base.collateralToken.approve(
                address(0x5FbDB2315678afecb367f032d93F642f64180aa3),
                base.amount
            );
        }

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .splitPosition(
                base.collateralToken,
                condition.parentCollectionId,
                condition.conditionId,
                base.partition,
                base.amount
            );
    }

    function reportPayouts(Condition storage condition) public {
        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .reportPayouts(condition.questionId, condition.payouts);
    }

    function proposePayouts(
        Condition storage condition,
        uint256[] calldata _payouts
    ) public {
        condition.status = Status.OutcomeProposed;
        condition.payouts = _payouts;
    }

    function confirmPayouts(Condition storage condition) public {
        condition.status = Status.OutcomeReported;
        reportPayouts(condition);
    }

    function reportPayouts(
        Condition storage condition,
        uint256[] memory payouts
    ) public {
        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .reportPayouts(condition.questionId, payouts);
    }

    function arbitrationPending(Condition storage condition) public {
        condition.status = Status.ArbitrationPending;
    }

    function arbitrationRequested(Condition storage condition) public {
        condition.status = Status.ArbitrationRequested;
    }

    function arbitrateNull(Condition storage condition) public {
        condition.status = Status.OutcomeProposed;
    }

    function arbitrate(Condition storage condition, uint256[] memory payouts)
        public
    {
        condition.status = Status.ArbitrationDelivered;
        reportPayouts(condition, payouts);
    }

    function addressFromChainIndex(
        uint256 index,
        address _this,
        address chainParent,
        address chainChild,
        uint256 chainIndex
    ) public view returns (address _address) {
        if (index == chainIndex) {
            return _this;
        } else if (index < chainIndex) {
            return ISolver(chainParent).addressFromChainIndex(index);
        } else if (index > chainIndex) {
            return ISolver(chainChild).addressFromChainIndex(index);
        }
    }

    function allocatePartition(
        Condition calldata condition,
        ConditionBase calldata base,
        address solver,
        Datas storage data,
        bytes32 trackingId
    ) public {
        uint256[] memory _tokens = new uint256[](base.partition.length);

        for (uint256 i; i < base.partition.length; i++) {
            _tokens[i] = getPositionId(
                condition,
                base.collateralToken,
                base.partition[i]
            );
        }

        for (uint256 i; i < base.recipientAddressPorts.length; i++) {
            IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
                .safeBatchTransferFrom(
                    solver,
                    abi.decode(
                        data.ports[base.recipientAddressPorts[i]],
                        (address)
                    ),
                    _tokens,
                    base.recipientAmounts[i],
                    abi.encode(trackingId)
                );
        }
    }

    function ingest(Ingest storage _ingest, address solver)
        public
        returns (bytes memory data)
    {
        _ingest.executions++;

        if (!_ingest.isConstant) {
            address _solver = Solver(solver).addressFromChainIndex(
                _ingest.solverIndex
            );
            (bool success, bytes memory retData) = _solver.staticcall(
                _ingest.data
            );
            require(success, "Ingest staticcall failed");
            data = retData;
        } else {
            data = _ingest.data;
        }
    }

    function getCanonCollectionId(
        Condition calldata condition,
        uint256 partition
    ) public view returns (bytes32 collectionId) {
        collectionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getCollectionId(
                condition.parentCollectionId,
                condition.conditionId,
                partition
            );
    }
}
