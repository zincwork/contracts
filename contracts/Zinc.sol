pragma solidity ^0.4.24;

import "./Identity.sol";

import "./SignatureValidator.sol";

contract Zinc is SignatureValidator {

    uint256 public nounce = 0;

    function checkUserSignature(address _userAddress, string _message1, uint32 _nounce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v) public returns (bool) {
        require(checkSignature(_message1, _nounce, _header1, _header2, _r, _s, _v) == _userAddress, "User signature must be the same as signed message");
        return true;
    }

    modifier checkNounce(uint _nounce) {
        require(++nounce == _nounce, "Wrong nounce");
        _;
    }

    function constructUserIdentity(address _userAddress, string _message1, uint32 _nounce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public
     returns (address)  {
        require(checkUserSignature(_userAddress, _message1, _nounce, _header1, _header2, _r, _s, _v), "User Signature not matched");

        address[] memory adresses = new address[](2);
        adresses[0] = _userAddress;
        adresses[1] = address(this);

        uint8[] memory permissions = new uint8[](2);
        permissions[0] = 15;
        permissions[1] = 7;

        Identity id = new Identity(adresses, permissions);
        return address(id);
    }

    function addKey(address _key, address _idContract, uint8 _purpose, address _userAddress, string _message1, uint32 _nounce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public checkNounce(_nounce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nounce, _header1, _header2, _r, _s, _v));
        Identity id = Identity(_idContract);
        id.addAccessor(_key, _purpose);
        return true;
    }


    function removeKey(address _key, address _idContract, address _userAddress, string _message1, uint32 _nounce, string _header1, string _header2, bytes32 _r, bytes32 _s, uint8 _v)
    public checkNounce(_nounce) returns (bool) {
        require(checkUserSignature(_userAddress, _message1, _nounce, _header1, _header2, _r, _s, _v));
        Identity id = Identity(_idContract);
        id.removeAccessor(_key);
        return true;
    }

}
