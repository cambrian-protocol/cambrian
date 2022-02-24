pragma solidity 0.8.0;

import "./SolverLib.sol";
import "./Solver.sol";

contract WriterSolverV1 is Solver {
    address public writer;
    address public buyer;

    event SentMessage(string cid, address sender);
    event SubmittedWork(string cid, address submitter);

    function postroll(uint256 _index) internal override {
        (bytes32 _writer, bytes32 _buyer) = abi.decode(
            config.data,
            (bytes32, bytes32)
        );

        writer = abi.decode(datas.slots[_writer][_index], (address));
        buyer = abi.decode(datas.slots[_buyer][_index], (address));
    }

    function sendMessage(string calldata cid) external {
        require(
            msg.sender == config.keeper ||
                msg.sender == config.arbitrator ||
                msg.sender == writer ||
                msg.sender == buyer
        );
        emit SentMessage(cid, msg.sender);
    }

    function submitWork(string calldata cid) external {
        require(msg.sender == writer, "Only Writer");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Disabled"
        );
        emit SubmittedWork(cid, msg.sender);
    }
}
