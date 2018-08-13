pragma solidity ^0.4.24;


contract SignatureValidator {

    function doHash(string _message1, uint32 _message2, string _header1, string _header2)
     pure internal returns (bytes32) {
        return keccak256(
            abi.encodePacked(
	              keccak256(abi.encodePacked(_header1, _header2)),
	              keccak256(abi.encodePacked(_message1, _message2)))
        );
    }

    /**
     * Returns address of signer for a signed message
     * @param _message1 message that was signed
     * @param _nonce nonce that was part of the signed message
     * @param _header1 header for the message (ex: "string Message")
     * @param _header2 header for the nonce (ex: "uint32 nonce")
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function checkSignature(string _message1, uint32 _nonce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
     public pure returns (address) {
        bytes32 hash = doHash(_message1, _nonce, _header1, _header2);
        return ecrecover(hash, _v, _r, _s);
    }

}
