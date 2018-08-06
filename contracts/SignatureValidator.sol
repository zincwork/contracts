pragma solidity ^0.4.24;


contract SignatureValidator {

    function doHash(string message1, uint32 message2, string header1, string header2)
     pure internal returns (bytes32) {
        return keccak256(
            abi.encodePacked(
	              keccak256(abi.encodePacked(header1, header2)),
	              keccak256(abi.encodePacked(message1, message2)))
        );
    }

    function checkSignature(string message1, uint32 nounce, string header1, string header2, bytes32 r, bytes32 s, uint8 v)
     public pure returns (address) {
        bytes32 hash = doHash(message1, nounce, header1, header2);
        return ecrecover(hash, v, r, s);
    }

}
