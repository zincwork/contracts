pragma solidity ^0.4.24;

import "./Identity.sol";
import "./Encoder.sol";
import "./SignatureValidator.sol";

/**
 * ZincAccesor contract used for constructing and managing Identity contracts
 * Access control is based on signed messages
 * This contract can be used as a trustless entity that creates an Identity contract and is used to manage it.
 * It operates as a proxy in order to allow users to interact with it based on signed messages and not spend any gas
 * It can be upgraded with the user consent by adding a instance of a new version and removing the old one.
 */

contract ZincAccessor is SignatureValidator {

    uint256 public nonce = 0;
    string private constant REMOVE_ACTION = "REMOVE_ACCESSOR";
    string private constant ADD_ACTION = "ADD_ACCESSOR";
    string private constant SIGN_UP = "SIGN_UP";
    string private constant LOGIN = "LOGIN";

    event UserIdentityCreated(address indexed userAddress, address indexed identityContractAddress);
    event AccessorAdded(address indexed identityContractAddress, address indexed keyAddress, uint256 indexed purpose);
    event AccessorRemoved(address indexed identityContractAddress, address indexed keyAddress, uint256 indexed purpose);


    modifier checknonce(uint _nonce) {
        require(++nonce == _nonce, "Wrong nonce");
        _;
    }

    /**
     * Constructs an Identity contract and returns its address
     * Requires a signed message to verify the identity of the initial user address
     * @param _userAddress user address
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function constructUserIdentity(
        address _userAddress,
        uint256 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public
     returns (address) {
        require(
            verifySignature(_r, _s, _v, SIGN_UP, _nonce, _userAddress, _userAddress),
            "User Signature does not match");

        Identity id = new Identity();
        id.addKey(keccak256(_userAddress), id.MANAGEMENT_KEY(), 1);

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
     * @param _nonce nonce that was part of the signed message
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function addAccessor(
        address _key,
        address _idContract,
        uint256 _purpose,
        address _userAddress,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(verifySignature(_r, _s, _v,ADD_ACTION, _nonce, _idContract, _userAddress), "User signature must match");

        Identity id = Identity(_idContract);
        require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

        id.addKey(keccak256(_key), _purpose, 1);
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
     * @param _nonce nonce that was part of the signed message
     * @param _r r from ECDSA
     * @param _s s from ECDSA
     * @param _v recovery id
     */
    function removeAccessor(
        address _key,
        address _idContract,
        uint256 _purpose,
        address _userAddress,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(verifySignature(_r, _s, _v, REMOVE_ACTION, _nonce, _idContract, _userAddress));

        Identity id = Identity(_idContract);
        require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

        id.removeKey(keccak256(_key), _purpose);

        emit AccessorRemoved(_idContract, _key, _purpose);
        return true;
    }

}
