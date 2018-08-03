pragma solidity ^0.4.24;

// TODO: make payable
contract Identity {
    uint256 constant MANAGEMENT = 3;
    uint256 constant READ_WRITE = 2;
    uint256 constant READ_ONLY = 1;

    event AccessorAdded(bytes32 indexed addressHash, uint256 indexed purpose);
    event AccessorRemoved(bytes32 indexed addressHash, uint256 indexed purpose);

    mapping(bytes32 => uint256) accessorMap;

    constructor(bytes32 initialAccessor) public {
        accessorMap[initialAccessor] = MANAGEMENT;
        emit AccessorAdded(initialAccessor, MANAGEMENT);
    }

    modifier allowedByPurpose(uint256 purpose) {
        require(accessorMap[keccak256(abi.encode(msg.sender))] >= purpose, "Not authorized");
        _;
    }

    modifier checkPurpose(uint256 purpose) {
        require(purpose >= READ_ONLY && purpose <= MANAGEMENT, "Invalid purpose");
        _;
    }

    function getAccessorPurpose(bytes32 addressHash) public view returns(uint256) {
        return accessorMap[addressHash];
    }

    function addAccessor(bytes32 addressHash, uint256 purpose) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose) {
        uint256 oldPurpose = accessorMap[addressHash];
        if (oldPurpose > 0) {
            emit AccessorRemoved(addressHash, oldPurpose);
        }
        accessorMap[addressHash] = purpose;
        emit AccessorAdded(addressHash, purpose);
    }

    function removeAccessor(bytes32 addressHash) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose)  {
        uint256 purpose = accessorMap[addressHash];
        delete accessorMap[addressHash];
        emit AccessorRemoved(addressHash, purpose);
    }
}
