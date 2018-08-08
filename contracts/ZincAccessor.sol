pragma solidity ^0.4.24;

import "./Identity.sol";

import "./SignatureValidator.sol";

contract ZincAccessor is SignatureValidator {

    uint256 public nonce = 0;

    event UserIdentityCreated(address indexed userAddress, address indexed identityContractAddress);
    event AccessorAdded(address indexed identityContractAddress, address indexed keyAddress, uint8 indexed purpose);
    event AccessorRemoved(address indexed identityContractAddress, address indexed keyAddress, uint8 purpose);


    function checkUserSignature(address _userAddress, string _message1, uint32 _nonce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v) public pure returns (bool) {
        require(checkSignature(_message1, _nonce, _header1, _header2, _r, _s, _v) == _userAddress, "User signature must be the same as signed message");
        return true;
    }

    modifier checknonce(uint _nonce) {
        require(++nonce == _nonce, "Wrong nonce");
        _;
    }

    function constructUserIdentity(address _userAddress, string _message1, uint32 _nonce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public
     returns (address)  {
        require(checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v), "User Signature not matched");

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

    function addAccessor(address _key, address _idContract, uint8 _purpose, address _userAddress, string _message1, uint32 _nonce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v));
        Identity id = Identity(_idContract);
        id.addAccessor(_key, _purpose);
        emit AccessorAdded(_idContract, _key, _purpose);
        return true;
    }


    function removeAccessor(address _key, address _idContract, address _userAddress, string _message1, uint32 _nonce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public checknonce(_nonce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v));
        Identity id = Identity(_idContract);
        uint8 acessorPurpose = id.getAccessorPurpose(_key);
        id.removeAccessor(_key);
        emit AccessorRemoved(_idContract, _key, acessorPurpose);
        return true;
    }

}
