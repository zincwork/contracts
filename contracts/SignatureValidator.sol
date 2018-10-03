pragma solidity ^0.4.24;


contract SignatureValidator {

    uint256 constant chainId = 1;
    address constant verifyingContract = 0x1C56346CD2A2Bf3202F771f50d3D14a367B48070;
    bytes32 constant salt = 0x7fea5b30300bd02ca3e22c7837f297a642201dca2185ee2408c2db05f12b94e3;
    
    string private constant EIP712_DOMAIN  = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    string private constant IDENTITY_TYPE = "Identity(string action,uint256 nonce,address wallet)";
 
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
    bytes32 private constant IDENTITY_TYPEHASH = keccak256(abi.encodePacked(IDENTITY_TYPE));
 
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256("Zinc"),
        keccak256("1"),  // version
        chainId,
        verifyingContract,
        salt
    ));
    
    
    struct Identity {
        string action;
        uint256 nonce;
        address wallet;
    }
    
    
    function hashIdentity(Identity memory id) internal pure returns (bytes32){
        return keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                IDENTITY_TYPEHASH,
                keccak256(id.action),
                id.nonce,
                id.wallet
            ))
        ));
    }
    
    function verifySignature(bytes32 _r,  bytes32 _s, bytes32 _v, string _action,
      uint256 _nonce, address _wallet, address _signer)
       public pure returns (bool)
    {
        Identity memory id = Identity({
            action: _action,
            nonce: _nonce,
            wallet: _wallet
        });
    
        return _signer == ecrecover(hashIdentity(id), _v, _r, _s);
    }

}
