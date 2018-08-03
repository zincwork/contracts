pragma solidity ^0.4.24;

// TODO: make payable
contract Identity {
    uint256 constant MANAGEMENT = 3;
    uint256 constant READ_WRITE = 2;
    uint256 constant READ_ONLY = 1;

    event AccessorAdded(address indexed key, uint256 indexed purpose);
    event AccessorRemoved(address indexed key, uint256 indexed purpose);

    mapping(address => uint256) accessorMap;

    constructor(address initialAccessor) public {
        accessorMap[initialAccessor] = MANAGEMENT;
        emit AccessorAdded(msg.sender, MANAGEMENT);
    }

    modifier allowedByPurpose(uint256 purpose) {
        require(accessorMap[msg.sender] >= purpose, "Not authorized");
        _;
    }

    modifier checkPurpose(uint256 purpose) {
        require(purpose >= READ_ONLY && purpose <= MANAGEMENT, "Invalid purpose");
        _;
    }

    function getAccessorPurpose(address key) public view returns(uint256) {
        return accessorMap[key];
    }

    function addAccessor(address key, uint256 purpose) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose) {
        uint256 oldPurpose = accessorMap[key];
        if (oldPurpose > 0) {
            emit AccessorRemoved(key, oldPurpose);
        }
        accessorMap[key] = purpose;
        emit AccessorAdded(key, purpose);
    }

    function removeAccessor(address key) public allowedByPurpose(MANAGEMENT) checkPurpose(purpose)  {
        uint256 purpose = accessorMap[key];
        delete accessorMap[key];
        emit AccessorRemoved(key, purpose);
    }
}
