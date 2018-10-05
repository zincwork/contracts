pragma solidity ^0.4.24;

contract SignatureValidator {
  uint256 chainId = 1;
  address verifyingContract = 0x1C56346CD2A2Bf3202F771f50d3D14a367B48070;
  bytes32 salt = 0x7fea5b30300bd02ca3e22c7837f297a642201dca2185ee2408c2db05f12b94e3;
  string private EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  string private CONSTRUCT_IDENTITY_TYPE = "Construct_Identity(string action,uint256 nonce)";
  string private ACCESSOR_TYPE = "Accessor_Action(string action,uint256 nonce,uint256 purpose,address addressToAdd,address contractAddress)";
  bytes32 private EIP712_DOMAIN_TYPEHASH = keccak256(
    abi.encodePacked(EIP712_DOMAIN)
  );
  bytes32 private IDENTITY_TYPEHASH = keccak256(
    abi.encodePacked(CONSTRUCT_IDENTITY_TYPE)
  );
  bytes32 private DOMAIN_SEPARATOR = keccak256(
    abi.encode(
      EIP712_DOMAIN_TYPEHASH,
      keccak256("Zinc"),
      keccak256("1"), // version
      chainId,
      verifyingContract,
      salt
    )
  );
  struct Accessor_Action {
    string action;
    uint256 nonce;
    uint256 purpose;
    address addressToAdd;
    address contractAddress;
  }
  struct Construct_Identity {
    string action;
    uint256 nonce;
  }

  function hashIdentity(Construct_Identity id) internal pure returns(bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(IDENTITY_TYPEHASH, keccak256(id.action), id.nonce))
      )
    );
  }

  function verifySignature(
    bytes32 _r,
    bytes32 _s,
    uint8 _v,
    string _action,
    uint256 _nonce,
    address _signer,
    bool construction
  ) public pure returns(bool) {
    if (construction) {
      Construct_Identity id = Construct_Identity({
        action: _action,
        nonce: _nonce
      });
      return _signer == ecrecover(hashIdentity(id), _v, _r, _s);
    }
  }
}
