pragma solidity ^0.4.24;

import "./Identity.sol";
import "./Encoder.sol";
import "./SignatureValidator.sol";

/**
 * ZincAccesor contract used for constructing and managing Identity contracts
 * Access control is based on signed messages.
 */

contract ZincAccessor is SignatureValidator, Encoder {

    uint256 public nonce = 0;

    event UserIdentityCreated(address indexed userAddress, address indexed identityContractAddress);
    event AccessorAdded(address indexed identityContractAddress, address indexed keyAddress, uint8 indexed purpose);
    event AccessorRemoved(address indexed identityContractAddress, address indexed keyAddress, uint8 indexed purpose);

    function checkUserSignature(
        address _userAddress,
        string _message1,
        uint32 _nonce,
        string _header1,
        string _header2,
        bytes32 _r,
        bytes32 _s,
        uint8 _v) 
    pure internal returns (bool) {
        require(
            checkSignature(_message1, _nonce, _header1, _header2, _r, _s, _v) == _userAddress,
            "User signature must be the same as signed message");
        return true;
    }

    modifier checknonce(uint _nonce) {
        require(++nonce == _nonce, "Wrong nonce");
        _;
    }

    /**
     * Constructs an Identity contract and returns its address
     * Requires a signed message to verify the identity of the initial user address
     * @param _userAddress user address
     * @param _message1 message that was signed
     * @param _nonce nonce that was part of the signed message
     * @param _header1 header for the message (ex: "string Message")
     * @param _header2 header for the nonce (ex: "uint32 nonce")
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function constructUserIdentity(
        address _userAddress,
        string _message1,
        uint32 _nonce,
        string _header1,
        string _header2,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public
     returns (address)  {
        require(
            checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v),
            "User Signature does not match");

        address[] memory adresses = new address[](2);
        adresses[0] = _userAddress;
        adresses[1] = address(this);

        uint8[] memory permissions = new uint8[](2);
        permissions[0] = 15;
        permissions[1] = 7;

        Identity id = new Identity(adresses, permissions);

        emit UserIdentityCreated(_userAddress, address(id));

        return address(id);
    }

    /**
     * Adds an accessor to an Identity contract
     * Requires a signed message to verify the identity of the initial user address
     * Requires _userAddress to have KEY_MANAGEMENT purpose on the Identity contract
     * Emits AccessorAdded
     * @param _key key to add to Identity
     * @param _purpose purpose for _key
     * @param _idContract address if Identity contract
     * @param _userAddress user address
     * @param _message1 message that was signed
     * @param _nonce nonce that was part of the signed message
     * @param _header1 header for the message (ex: "string Message")
     * @param _header2 header for the nonce (ex: "uint32 nonce")
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function addAccessor(
        address _key,
        address _idContract,
        uint8 _purpose,
        address _userAddress,
        string _message1,
        uint32 _nonce,
        string _header1,
        string _header2,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v));
        require(
            keccak256(abi.encodePacked("Add 0x", encodeAddress(_key), " to 0x", encodeAddress(_idContract), " with purpose ", encodeUInt(_purpose))) == 
            keccak256(encodeString(_message1)), "Message incorrect");

        Identity id = Identity(_idContract);
        require(id.getAccessorPurpose(_userAddress) & id.KEY_MANAGEMENT() != 0);

        id.addAccessor(_key, _purpose);
        emit AccessorAdded(_idContract, _key, _purpose);
        return true;
    }

    /**
     * Remove an accessor from Identity contract
     * Requires a signed message to verify the identity of the initial user address
     * Requires _userAddress to have KEY_MANAGEMENT purpose on the Identity contract
     * Emits AccessorRemoved
     * @param _key key to add to Identity
     * @param _idContract address if Identity contract
     * @param _userAddress user address
     * @param _message1 message that was signed
     * @param _nonce nonce that was part of the signed message
     * @param _header1 header for the message (ex: "string Message")
     * @param _header2 header for the nonce (ex: "uint32 nonce")
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function removeAccessor(
        address _key,
        address _idContract,
        address _userAddress,
        string _message1,
        uint32 _nonce,
        string _header1,
        string _header2,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v));
        require(
            keccak256(abi.encodePacked("Remove 0x", encodeAddress(_key), " from 0x", encodeAddress(_idContract))) ==
            keccak256(encodeString(_message1)), "Message incorrect");
    
        Identity id = Identity(_idContract);
        require(id.getAccessorPurpose(_userAddress) & id.KEY_MANAGEMENT() != 0);

        uint8 acessorPurpose = id.getAccessorPurpose(_key);
        id.removeAccessor(_key);
        emit AccessorRemoved(_idContract, _key, acessorPurpose);
        return true;
    }

}
