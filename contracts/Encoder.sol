pragma solidity ^0.4.24;

contract Encoder {

    function uintToChar(uint8 _uint) internal pure returns(string) {
        string[16] memory chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
        return chars[_uint & 15];
    }

    function addressToBytes(address _address) internal pure returns (bytes memory b) {
        b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(_address) / (2**(8*(19 - i)))));
    }

    function encodeBytes(bytes arr, uint8 _length) internal pure returns (bytes memory res) {
        for (uint i = 0; i < _length; i++) {
            byte b = arr[i];
            uint8 high = uint8(b >> 4);
            uint8 low = uint8(b << 4 >> 4);
            res = abi.encodePacked(res, uintToChar(high), uintToChar(low));
        }
        return res; 
    }

    /**
     *  Encodes the string representation of a uint8 into bytes
     */
    function encodeUInt(uint8 _uint) public pure returns(bytes memory) {
        uint8 high = uint8(_uint >> 4);
        uint8 low = uint8(_uint << 4 >> 4);
        if (high > 0) {
            return abi.encodePacked(uintToChar(high), uintToChar(low));
        } else {
            return abi.encodePacked(uintToChar(low));
        }
    }

    /**
     *  Encodes the string representation of an address into bytes
     */
    function encodeAddress(address _address) public pure returns (bytes memory) {
        return encodeBytes(addressToBytes(_address), 20);
    }

    /**
     *  Encodes a string into bytes
     */
    function encodeString(string _str) public pure returns (bytes memory) {
        return abi.encodePacked(_str);
    }
}
