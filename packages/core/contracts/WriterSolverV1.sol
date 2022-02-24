pragma solidity 0.8.0;

import "./SolverLib.sol";
import "./Solver.sol";

contract WriterSolverV1 is Solver {
    address writer;
    address buyer;
    SolverLib.Multihash[] submittedWork;

    event SentMessage(SolverLib.Multihash cid, address sender);
    event SubmittedWork(SolverLib.Multihash cid, address submitter);

    function postroll(uint256 _index) internal override {
        (bytes32 _writer, bytes32 _buyer) = abi.decode(
            config.data,
            (bytes32, bytes32)
        );

        writer = abi.decode(
            datas.slots[_writer][datas.slots[_writer].length - 1],
            (address)
        );

        buyer = abi.decode(
            datas.slots[_buyer][datas.slots[_buyer].length - 1],
            (address)
        );
    }

    function sendMessage(SolverLib.Multihash calldata cid) external {
        require(
            msg.sender == config.keeper ||
                msg.sender == config.arbitrator ||
                msg.sender == writer ||
                msg.sender == buyer
        );
        emit SentMessage(cid, msg.sender);
    }

    function submitWork(SolverLib.Multihash calldata cid) external {
        require(msg.sender == writer, "Only Writer");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Disabled"
        );
        submittedWork.push(cid);
        emit SubmittedWork(cid, msg.sender);
    }

    function getWork()
        external
        view
        returns (SolverLib.Multihash[] memory work)
    {
        return submittedWork;
    }
}
