<h1 align="center">Zinc Security Smart Contracts Audit</h1>

# Disclaimer 

The audit isn’t a legal document that verifies that the code is secure. Nobody can assure that the code won’t have future bugs or vulnerabilities.  

The scope of this audit was to analyze and document Zinc’s smart contract codebase for quality, security and correctness. This audit guarantees that your code has been revised by an expert and it’s secure. 

# Issues found 

## Hardcoded address 

The contract contains unknown address. This address might be used for some malicious activity. Please check hardcoded address and it's usage.

### Examples from Zinc contracts

**Ownable.sol | Line: 45 | Severity: 1**

```solidity

owner = address(0);

```

## Constant functions 

The function is declared as <code> constant </code>. Currently, for functions the <code> constant </code> modifier is a synonym for <code> view </code> (which is the preferred option). Consider using <code> view </code> for funcitons and <code> constant </code> for state variables.

### Examples from Zinc contracts

**Identity.sol | Line: 9 | Severity: 0**

```solidity

function balanceOf(address _who) public constant returns (uint256);

```

**ERC725.sol | Line: 24 | Severity: 0**


```solidity

function getKey(bytes32 _key) public constant returns(uint256[] purpose, uint256 keyType, bytes32 key);

```

**ERC725.sol | Line: 25 | Severity: 0**

```solidity

function getKeyPurpose(bytes32 _key) public constant returns(uint256[] purpose);

```

**ERC725.sol | Line: 26 | Severity: 0**

```solidity

function getKeysByPurpose(uint256 _purpose) public constant returns(bytes32[] keys);

```

## DoS by external function call in require

The contract that calls functions of other contracts should not rely on results of these functions. Be careful when verifying the result of external calls with require as called contract can always return false and prevent correct execution. Especially if the contract relies on state changes made by this function.

This pattern is experimental and can report false issues. This pattern might be also triggered when:

- accessing struct's field
- using enum's element

To avoid this vulnerability, you can use the Checks-Effects-Interactions pattern.

### Examples from Zinc contracts


**Identity.sol | Line: 139 | Severity: 1**

```solidity

require(!executions[executionNonce].executed, "Already executed");

```

**Identity.sol | Line: 255 | Severity: 1**

```solidity

assert(token.transfer(msg.sender, balance));

```

**Identity.sol | Line: 271 | Severity: 1**

```solidity

assert(token.transfer(_to, _amount));

```

**Identity.sol | Line: 159 | Severity: 1**

```solidity

 require(keys[_key].key == _key, "No such key");

```

**ZincAccessor.sol | Lines: 152 - 154 | Severity: 1**

```solidity

require(
            keccak256(abi.encodePacked("Remove 0x", encodeAddress(_key), " from 0x", encodeAddress(_idContract), " with purpose ", encodeUInt(_purpose))) ==
            keccak256(encodeString(_message1)), "Message incorrect");

```

**ZincAccessor.sol | Line: 115 | Severity: 1**

```solidity

require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

```

**ZincAccessor.sol | Line: 157 | Severity: 1**

```solidity

require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

```

**ZincAccessor.sol | Line: 110-112 | Severity: 1**

```solidity

require(
            keccak256(abi.encodePacked("Add 0x", encodeAddress(_key), " to 0x", encodeAddress(_idContract), " with purpose ", encodeUInt(_purpose))) ==
            keccak256(encodeString(_message1)), "Message incorrect");

```


## Using the approve function of the ERC-20 standard 

The <code> approve </code> function of ERC-20 might lead to vulnerabilities.

### Attack Analysis

Here is possible attack scenario:
Alice allows Bob to transfer N of Alice's tokens (N>0)  by calling approve method on Token smart contract passing Bob's address and N as method arguments
After some time, Alice decides to change from N to M (M>0) the number of Alice's tokens Bob is allowed to transfer, so she calls approve method again, this time passing Bob's address and M as method arguments
Bob notices Alice's second transaction before it was mined and quickly sends another transaction that calls transferFrom method to transfer N Alice's tokens somewhere
If Bob's transaction will be executed before Alice's transaction, then Bob will successfully transfer N Alice's tokens and will gain an ability to transfer another M tokens
Before Alice noticed that something went wrong, Bob calls transferFrom method again, this time to transfer M Alice's tokens.
So, Alice's attempt to change Bob's allowance from N to M (N>0 and M>0) made it possible for Bob to transfer N+M of Alice's tokens, while Alice never wanted to allow so many of her tokens to be transferred by Bob.

### Attack scenario

The attack described above is possible because approve method overrides current allowance regardless of whether spender already used it or not, so there is no way to increase or decrease allowance by certain value atomically, unless token owner is a smart contract, not an account.

### Workaround

Because the described attack allows an attacker to transfer at most N + M tokens when allowance is being changed from N to M, then changing allowance from N to 0 and then from 0 to M seems quite safe.  Token owner just needs to make sure that first transaction actually changed allowance from N to 0, i.e. that the spender didn't manage to transfer some of N allowed tokens before first transaction was mined.  Unfortunately, such checking does not seem to be possible via standard Web3 API, because to do the check one needs to be able to analyze changes in the storage of smart contract made by particular transactions, including internal transactions.  Though, such checking is still possible using advanced blockchain explorers such as EtherCamp.
Another way to mitigate the threat is to approve token transfers only to smart contracts with verified source code that does not contain logic for performing attacks like described above, and to accounts owned by the people you may trust.

### Examples from Zinc contracts

**StandardToken.sol | Lines: 88 - 92 | Severity: 2**

```solidity

function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

```

## No payable fallback function 

The contract does not have <code> payable </code> fallback. All attempts to <code> transfer </code> or <code> send </code> ether to this contract will be reverted.

### Examples from Zinc contracts

**Encoder.sol | Lines: 3 - 57 | Severity: 1**

```solidity

contract Encoder {

    function uintToChar(uint8 _uint) internal pure returns(string) {
        byte b = "\x30"; // ASCII code for 0
        if (_uint > 9) {
            b = "\x60";  // ASCII code for the char before a
            _uint -= 9;
        }
        bytes memory bs = new bytes(1);
        bs[0] = b | byte(_uint);
        return string(bs);
    }

    /**
     *  Encodes the string representation of a uint8 into bytes
     */
    function encodeUInt(uint256 _uint) public pure returns(bytes memory) {
        if (_uint == 0) {
            return abi.encodePacked(uintToChar(0));
        }

        bytes memory result;
        uint256 x = _uint;
        while (x > 0) {
            result = abi.encodePacked(uintToChar(uint8(x % 10)), result);
            x /= 10;
        }
        return result;
    }

    /**
     *  Encodes the string representation of an address into bytes
     */
    function encodeAddress(address _address) public pure returns (bytes memory res) {
        for (uint i = 0; i < 20; i++) {
            // get each byte of the address
            byte b = byte(uint8(uint(_address) / (2**(8*(19 - i)))));

            // split it into two
            uint8 high = uint8(b >> 4);
            uint8 low = uint8(b) & 15;

            // and encode them as chars
            res = abi.encodePacked(res, uintToChar(high), uintToChar(low));
        }
        return res;
    }

    /**
     *  Encodes a string into bytes
     */
    function encodeString(string _str) public pure returns (bytes memory) {
        return abi.encodePacked(_str);
    }
}
```

**Migrations.sol | Lines: 4 - 24 | Severity: 1**

```solidity
contract Migrations {
    address public owner;
    uint public last_completed_migration;

    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
```

**StandardToken.sol | Lines: 14 - 167 | Severity: 1**

```solidity

contract StandardToken is ERC20 {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    mapping (address => mapping (address => uint256)) internal allowed;

    uint256 totalSupply_;
    /**
        Add missing constructor
     */

    constructor(uint256 _totalSupply) public {
        balances[msg.sender] = _totalSupply;
        totalSupply_ = _totalSupply;
    }

  /**
  * @dev Total number of tokens in existence
  */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
    function allowance(
        address _owner,
        address _spender
   )
    public
    view
    returns (uint256)
    {
        return allowed[_owner][_spender];
    }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_value <= balances[msg.sender]);
        require(_to != address(0));

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
  )
    public
    returns (bool)
    {
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);
        require(_to != address(0));

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
    function increaseApproval(
        address _spender,
        uint256 _addedValue
    )
    public
    returns (bool)
    {
        allowed[msg.sender][_spender] = (
        allowed[msg.sender][_spender].add(_addedValue));
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
    function decreaseApproval(
        address _spender,
        uint256 _subtractedValue
    )
    public
    returns (bool)
    {
        uint256 oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue >= oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}

```

**Identity.sol | Lines: 8 - 11 | Severity: 1**

```solidity

contract ERC20Basic {
    function balanceOf(address _who) public constant returns (uint256);
    function transfer(address _to, uint256 _value) public returns (bool);
}

```

**ERC725.sol | Lines: 5 - 31 | Severity: 1**

```solidity

contract ERC725 {

    uint256 public constant MANAGEMENT_KEY = 1;
    uint256 public constant ACTION_KEY = 2;
    uint256 public constant CLAIM_SIGNER_KEY = 3;
    uint256 public constant ENCRYPTION_KEY = 4;

    event KeyAdded(bytes32 indexed key, uint256 indexed purpose, uint256 indexed keyType);
    event KeyRemoved(bytes32 indexed key, uint256 indexed purpose, uint256 indexed keyType);
    event ExecutionRequested(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);
    event Executed(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);
    event Approved(uint256 indexed executionId, bool approved);

    struct Key {
        uint256[] purpose; //e.g., MANAGEMENT_KEY = 1, ACTION_KEY = 2, etc.
        uint256 keyType; // e.g. 1 = ECDSA, 2 = RSA, etc.
        bytes32 key;
    }

    function getKey(bytes32 _key) public constant returns(uint256[] purpose, uint256 keyType, bytes32 key);
    function getKeyPurpose(bytes32 _key) public constant returns(uint256[] purpose);
    function getKeysByPurpose(uint256 _purpose) public constant returns(bytes32[] keys);
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType) public returns (bool success);
    function removeKey(bytes32 _key, uint256 _purpose) public returns (bool success);
    function execute(address _to, uint256 _value, bytes _data) public returns (uint256 executionId);
    function approve(uint256 _id, bool _approve) public returns (bool success);
}

```

**ERC20.sol | Lines: 9 -33 | Severity: 1**

```solidity

contract ERC20 {
    function totalSupply() public view returns (uint256);

    function balanceOf(address _who) public view returns (uint256);

    function allowance(address _owner, address _spender) public view returns (uint256);

    function transfer(address _to, uint256 _value) public returns (bool);

    function approve(address _spender, uint256 _value) public returns (bool);

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

```

**ZincAccessor.sol | Lines: 15 - 165 | Severity: 1**

```solidity

contract ZincAccessor is SignatureValidator, Encoder {

    uint256 public nonce = 0;

    event UserIdentityCreated(address indexed userAddress, address indexed identityContractAddress);
    event AccessorAdded(address indexed identityContractAddress, address indexed keyAddress, uint256 indexed purpose);
    event AccessorRemoved(address indexed identityContractAddress, address indexed keyAddress, uint256 indexed purpose);

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
     returns (address) {
        require(
            checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v),
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
     * @param _message1 message that was signed of the form "Add {_key} to {_idContract} with purpose {_purpose}"
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
        uint256 _purpose,
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
     * @param _message1 message that was signed of the form "Remove {_key} from {_idContract}"
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
        uint256 _purpose,
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
            keccak256(abi.encodePacked("Remove 0x", encodeAddress(_key), " from 0x", encodeAddress(_idContract), " with purpose ", encodeUInt(_purpose))) ==
            keccak256(encodeString(_message1)), "Message incorrect");

        Identity id = Identity(_idContract);
        require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

        id.removeKey(keccak256(_key), _purpose);

        emit AccessorRemoved(_idContract, _key, _purpose);
        return true;
    }

}

```


## Compiler version not fixed

Solidity source files indicate the versions of the compiler they can be compiled with.

```solidity

pragma solidity ^0.4.17; // bad: compiles w 0.4.17 and above
pragma solidity 0.4.17; // good : compiles w 0.4.17 only

```

It is recommended to follow the latter example, as future compiler versions may handle certain language constructions in a way the developer did not foresee.


### Examples from Zinc contracts

**Encoder.sol | Line: 1  | Severity: 2**

```solidity

pragma solidity ^0.4.24;

```

**Migrations.sol | Line: 2  | Severity: 2**

```solidity

pragma solidity ^0.4.23;

```

**SafeMath.sol | Line: 1  | Severity: 2**

```solidity

pragma solidity ^0.4.24;

```

**StandardToken.sol | Line: 1  | Severity: 2**

```solidity

pragma solidity ^0.4.24;

```

**Identity.sol | Line: 4  | Severity: 2**

```solidity

pragma solidity ^0.4.22;

```

## Reentrancy 

Any interaction from a contract (A) with another contract (B) and any transfer of Ether hands over control to that contract (B). This makes it possible for B to call back into A before this interaction is completed.

This pattern is experimental and can report false issues. This pattern might also be triggered when

- accessing struct's field
- using enum's element

Note that re-entrancy is not only an effect of Ether transfer but of any function call on another contract. Furthermore, you also have to take multi-contract situations into account. A called contract could modify the state of another contract you depend on.

### Examples from Zinc contracts

**ZincAccessor.sol | Line: 72  | Severity: 3**

```solidity

id.addKey(keccak256(_userAddress), id.MANAGEMENT_KEY(), 1);

```

**ZincAccessor.sol | Line: 115  | Severity: 3**

```solidity

require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

```

**ZincAccessor.sol | Line: 153  | Severity: 3**

```solidity

 keccak256(abi.encodePacked("Remove 0x", encodeAddress(_key), " from 0x", encodeAddress(_idContract), " with purpose ", encodeUInt(_purpose))) ==

```

**ZincAccessor.sol | Line: 157  | Severity: 3**

```solidity

require(id.keyHasPurpose(keccak256(_userAddress), id.MANAGEMENT_KEY()));

```

**Identity.sol | Line: 51  | Severity: 3**

```solidity

keys[_key].key = _key;

```

**Identity.sol | Line: 111  | Severity: 3**

```solidity

success = executions[_id].to.call(executions[_id].data, 0);

```

**Identity.sol | Line: 176  | Severity: 3**

```solidity

delete keys[_key].purpose[arrayLength - 1];

```


**Identity.sol | Line: 200  | Severity: 3**

```solidity

if (keys[_key].key == 0) return false;

```

## Timestamp dependance

The timestamp of the block can be slightly manipulated by the miner. One should not use timestamp's exact value for critical components of the contract.

### Examples from Zinc contracts

**Registry.sol | Line: 32  | Severity: 2**

```solidity

emit ClaimSet(subject, issuer, id, key, data, now);

```

**Registry.sol | Line: 39  | Severity: 2**

```solidity

emit ClaimRemoved(subject, issuer, id, key, now);

```

## Unchecked low-level call 

Expect calls to external contract to fail. When sending ether, check for the return value and handle errors. The recommended way of doing ether transfers is <code> transfer </code>.
External calls may execute malicious code in that contract or any other contract that it depends upon. As such, every external call should be treated as a potential security risk.

### Example from Zinc contracts

**Identity.sol | Line: 111  | Severity: 3**

```solidity

success = executions[_id].to.call(executions[_id].data, 0);

```


## Unchecked math

Solidity is prone to integer over- and underflow. Overflow leads to unexpected effects and can lead to loss of funds if exploited by a malicious account.

### Examples from Zinc contracts

**Identity.sol | Line: 175  | Severity: 1**

```solidity

keys[_key].purpose[uint(index)] = keys[_key].purpose[arrayLength - 1];

```

**Identity.sol | Line: 176  | Severity: 1**

```solidity

keys[_key].purpose[uint(index)] = keys[_key].purpose[arrayLength - 1];

```

**Identity.sol | Line: 177  | Severity: 1**

```solidity

keys[_key].purpose.length--;

```


**Identity.sol | Line: 183  | Severity: 1**

```solidity

keysByPurpose[_purpose][j] = keysByPurpose[_purpose][purposesLen - 1];

```


**Identity.sol | Line: 184  | Severity: 1**

```solidity

delete keysByPurpose[_purpose][purposesLen - 1];

```

**Encoder.sol | Line: 39  | Severity: 1**

```solidity

byte b = byte(uint8(uint(_address) / (2**(8*(19 - i)))));

```

**Encoder.sol | Line: 27  | Severity: 1**

```solidity

result = abi.encodePacked(uintToChar(uint8(x % 10)), result);

```

**Encoder.sol | Line: 9  | Severity: 1**

```solidity

_uint -= 9;

```



