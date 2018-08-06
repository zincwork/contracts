pragma solidity ^0.4.24;

// TODO: make payable
contract Identity {
    uint8 constant MANAGEMENT = 3;
    uint8 constant READ_WRITE = 2;
    uint8 constant READ_ONLY = 1;

    event AccessorAdded(address indexed key, uint8 indexed purpose);
    event AccessorRemoved(address indexed key, uint8 indexed purpose);
    event AccessorUpdated(address indexed key, uint8 indexed oldPurpose, uint8 indexed newPurpose);

    mapping(address => uint8) accessorMap;

    constructor(address[] initialAccessors) public {
        uint arrayLength = initialAccessors.length;
        for(uint i = 0; i < arrayLength; i++) {
            accessorMap[initialAccessors[i]] = MANAGEMENT;
            emit AccessorAdded(initialAccessors[i], MANAGEMENT);
        }
    }

    modifier allowedByPurpose(uint8 purpose) {
        require(accessorMap[msg.sender] >= purpose, "Not authorized");
        _;
    }

    modifier checkPurpose(uint8 purpose) {
        require(purpose >= READ_ONLY && purpose <= MANAGEMENT, "Invalid purpose");
        _;
    }

    function getAccessorPurpose(address key) public view returns(uint8) {
        return accessorMap[key];
    }

    function addAccessor(address key, uint8 purpose) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose) {
        uint8 oldPurpose = accessorMap[key];
        accessorMap[key] = purpose;
        if (oldPurpose != 0) {
            emit AccessorUpdated(key, oldPurpose, purpose);
        } else {
            emit AccessorAdded(key, purpose);
        }
    }

    function removeAccessor(address key) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose)  {
        uint8 purpose = accessorMap[key];
        delete accessorMap[key];
        emit AccessorRemoved(key, purpose);
    }
}
