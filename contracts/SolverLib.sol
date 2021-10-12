pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Solver.sol";
import "./interfaces/ISolver.sol";
import "./interfaces/IConditionalTokens.sol";
import "./interfaces/ISolverFactory.sol";

library SolverLib {
    // Ingest Types
    enum IngestType {
        Callback,
        Constant,
        Function
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

    struct Multihash {
        bytes32 digest;
        uint8 hashFunction;
        uint8 size;
    }

    // Expected sources of data being ingested into the Solver
    struct Ingest {
        uint256 executions; // Number of times this Ingest has been executed
        IngestType ingestType;
        uint256 slot; // Destination slot for data
        uint256 solverIndex; // Index of the Solver in the chain to make function call to or register callback
        bytes data; // Raw when isConstant=true, slot index of upstream solver data when callback, else an encoded function call
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
        uint256 parentCollectionIndexSet; // IndexSet to get parentCollectionId from parent Solver
        uint256 amountSlot; // Slot for amount of collateral being used        // TODO maybe make this dynamic also
        uint256[] partition; // Partition of positions for payouts
        uint256[] recipientAddressSlots; // Arrays of [i] for addressSlots[i] containing CT recipients
        uint256[][] recipientAmountSlots; // Arrays containing amount of CTs to send to each recipient for each partition
        Multihash[] outcomeURIs; // Resource containing human-friendly descriptions of the conditions for this Solver
    }

    // Configuration of this Solver
    struct Config {
        Solver implementation; // The implementation address for this Solver
        address keeper; // Keeper address
        address arbitrator; // Arbitrator address
        uint256 timelockSeconds; // Number of seconds to increment timelock for during critical activities
        bytes data; // Arbitrary data
        Ingest[] ingests; // Data ingests to be performed to bring data in from other Solver
        ConditionBase conditionBase; // Base to create conditions from
    }

    struct Datas {
        mapping(uint256 => bytes) slots;
        mapping(uint256 => uint256) slotVersions;
    }

    struct Callbacks {
        uint256 numIncoming;
        uint256 numOutgoing;
        mapping(uint256 => address[]) outgoing; // This Slot => Solver expecting callback
        mapping(bytes32 => uint256) incoming; // keccack256(Address, CallerSlot) => ingest index
    }

    function createCondition(
        ConditionBase calldata base,
        address chainParent,
        uint256 conditionIdx
    ) public returns (Condition memory condition) {
        condition.questionId = keccak256(
            abi.encode(base.outcomeURIs, address(this), conditionIdx)
        );

        if (chainParent == address(0)) {
            condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            Condition[] memory _chainParentConditions = ISolver(chainParent)
                .getConditions();

            require(
                _chainParentConditions.length > 0,
                "Parent has no conditions"
            );

            condition.parentCollectionId = getCollectionId(
                _chainParentConditions[_chainParentConditions.length - 1],
                base.parentCollectionIndexSet
            );
        }

        condition.conditionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getConditionId(
                address(this), // Solver is Oracle
                condition.questionId,
                base.outcomeSlots
            );

        condition.collateralToken = base.collateralToken;

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .prepareCondition(
                address(this),
                condition.questionId,
                base.outcomeSlots
            );
    }

    function deployChild(
        Config calldata config,
        address solver,
        uint256 solverIndex
    ) public returns (address child, Solver) {
        child = ISolverFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
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
        Condition calldata condition,
        uint256 amount
    ) public {
        // uint256 _amount;

        if (chainParent == address(0)) {
            // _amount = IERC20(base.collateralToken).balanceOf(address(this));
            // require(_amount > 0, "No collateral.");

            base.collateralToken.approve(
                address(0x5FbDB2315678afecb367f032d93F642f64180aa3),
                amount
            );
        }

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .splitPosition(
                base.collateralToken,
                condition.parentCollectionId,
                condition.conditionId,
                base.partition,
                amount
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

    function allocatePartition(
        Condition calldata condition,
        ConditionBase calldata base,
        address solver,
        Datas storage data,
        bytes32 trackingId
    ) public {
        uint256[] memory _tokens = new uint256[](base.partition.length);
        uint256[][] memory _amounts = new uint256[][](
            base.recipientAddressSlots.length
        );

        for (uint256 i; i < base.partition.length; i++) {
            _tokens[i] = getPositionId(
                condition,
                base.collateralToken,
                base.partition[i]
            );
        }

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            _amounts[i] = new uint256[](base.partition.length);

            for (uint256 j; j < base.partition.length; j++) {
                _amounts[i][j] = abi.decode(
                    data.slots[base.recipientAmountSlots[j][i]],
                    (uint256)
                );
            }
        }

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
                .safeBatchTransferFrom(
                    solver,
                    abi.decode(
                        data.slots[base.recipientAddressSlots[i]],
                        (address)
                    ),
                    _tokens,
                    _amounts[i],
                    abi.encode(trackingId)
                );
        }
    }

    function ingest(Ingest storage _ingest) public returns (bytes memory data) {
        _ingest.executions++;

        if (_ingest.ingestType != IngestType.Constant) {
            address _solver = ISolver(address(this)).addressFromChainIndex(
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

    function ingestsValid(Ingest[] calldata ingests, uint256 conditionVer)
        public
        pure
        returns (bool)
    {
        for (uint256 i; i < ingests.length; i++) {
            if (ingests[i].executions != conditionVer) {
                return false;
            }
        }

        return true;
    }

    function getCollectionId(Condition memory condition, uint256 partition)
        public
        view
        returns (bytes32 collectionId)
    {
        collectionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getCollectionId(
                condition.parentCollectionId,
                condition.conditionId,
                partition
            );
    }
}
