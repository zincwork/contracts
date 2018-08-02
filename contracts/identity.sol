pragma solidity ^0.4.24;

// TODO: make payable
contract Identity {
    uint256 constant MANAGEMENT = 3;
    uint256 constant READ_WRITE = 2;
    uint256 constant READ_ONLY = 1;

    event KeyAdded(address indexed key, uint256 indexed purpose);
    event KeyRemoved(address indexed key, uint256 indexed purpose);
    event AccessorAdded(address indexed key, uint256 indexed purpose);
    event AccessorRemoved(address indexed key, uint256 indexed purpose);

    mapping(address => uint256) keyMap;
    mapping(address => uint256) accessorMap;

    constructor(address initialAccessor) public {
        accessorMap[initialAccessor] = MANAGEMENT;
        emit AccessorAdded(msg.sender, MANAGEMENT);
    }

    modifier allowedByPurpose(uint256 purpose) {
        require(accessorMap[msg.sender] >= purpose);
        _;
    }

    function getKeyPermissions(address key) public view returns(uint256) {
        return keyMap[key];
    }

    function getAccessorPermissions(address key) public view returns(uint256) {
        return accessorMap[key];
    }

    function addKey(address key, uint256 purpose) public allowedByPurpose(MANAGEMENT) {
        uint256 oldPurpose = keyMap[key];
        if (oldPurpose > 0) {
            emit KeyRemoved(key, oldPurpose);
        }
        keyMap[key] = purpose;
        emit KeyAdded(key, purpose);
    }

    function removeKey(address key) public allowedByPurpose(MANAGEMENT) {
        uint256 purpose = keyMap[key];
        delete keyMap[key];
        emit KeyRemoved(key, purpose);
    }

    function addAccessor(address key, uint256 purpose) public allowedByPurpose(MANAGEMENT) {
        uint256 oldPurpose = accessorMap[key];
        if (oldPurpose > 0) {
            emit AccessorRemoved(key, oldPurpose);
        }
        accessorMap[key] = purpose;
        emit AccessorAdded(key, purpose);
    }

    function removeAccessor(address key) public allowedByPurpose(MANAGEMENT) {
        uint256 purpose = accessorMap[key];
        delete accessorMap[key];
        emit AccessorRemoved(key, purpose);
    }
}
