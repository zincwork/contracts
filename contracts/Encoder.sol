pragma solidity ^0.4.24;

contract Encoder {

    function uintToChar(uint8 _uint) internal pure returns(string) {
        byte b = "\x30"; // ASCII code for 0
        if (_uint > 9) {
            b = "\x60";  // ASCII code for the char before a
            _uint -= 9;
        }
        bytes memory bs = new bytes(1);
        bs[0] = b | byte(_uint);
        return string(bs);
    }

    /**
     *  Encodes the string representation of a uint8 into bytes
     */
    function encodeUInt(uint256 _uint) public pure returns(bytes memory) {
        if (_uint == 0) {
            return abi.encodePacked(uintToChar(0));
        }

        bytes memory result;
        uint256 x = _uint;
        while (x > 0) {
            result = abi.encodePacked(uintToChar(uint8(x % 10)), result);
            x /= 10;
        }
        return result;
    }

    /**
     *  Encodes the string representation of an address into bytes
     */
    function encodeAddress(address _address) public pure returns (bytes memory res) {
        for (uint i = 0; i < 20; i++) {
            // get each byte of the address
            byte b = byte(uint8(uint(_address) / (2**(8*(19 - i)))));

            // split it into two
            uint8 high = uint8(b >> 4);
            uint8 low = uint8(b) & 15;

            // and encode them as chars
            res = abi.encodePacked(res, uintToChar(high), uintToChar(low));
        }
        return res;
    }

    /**
     *  Encodes a string into bytes
     */
    function encodeString(string _str) public pure returns (bytes memory) {
        return abi.encodePacked(_str);
    }
}
