pragma solidity ^0.8.0;
import "hardhat/console.sol";

// Actions {ParseBytes32, ParseAddress, ParseUint256}

contract Argparse {
    constructor() {}

    bytes32[] data;
    address[] addresses;
    uint256[] values;

    function ingestByteStream(bytes calldata _data) external {
        parseData(_data);
    }

    function encodeBytes32(bytes32 _bytes) public pure returns (bytes memory) {
        return abi.encodePacked(uint8(0), _bytes);
    }

    function encodeAddress(address _address)
        public
        pure
        returns (bytes memory)
    {
        return abi.encodePacked(uint8(1), _address);
    }

    function encodeUint(uint256 _uint) public pure returns (bytes memory) {
        return abi.encodePacked(uint8(2), _uint);
    }

    function parseData(bytes memory _data) internal {
        uint8 _action;
        bytes32 _slice;
        uint256 j;

        for (uint256 i = 1; i < _data.length; i = i + 64) {
            j = i + 32;

            assembly {
                _action := mload(add(_data, i))
                _slice := mload(add(_data, j))
            }

            if (_action == 0) {
                parseBytes32(_slice);
            } else if (_action == 1) {
                parseAddress(_slice);
            } else if (_action == 2) {
                parseUint(_slice);
            }
        }
    }

    function parseBytes32(bytes32 _data) public returns (bytes32) {
        return _data;
    }

    function parseAddress(bytes32 _data) public returns (address) {
        address _parsed = address(uint160(bytes20(_data)));
        return _parsed;
    }

    function parseUint(bytes32 _data) public returns (uint256) {
        uint256 _parsed = uint256(_data);
        return _parsed;
    }
}
