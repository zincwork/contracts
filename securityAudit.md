<h1 align="center">Zinc Security Smart Contracts Audit</h1>

# Disclaimer 

The audit isn’t a legal document that verifies that the code is secure. Nobody can assure that the code won’t have future bugs or vulnerabilities.  

The scope of this audit was to analyze and document CHAINGEAR’s smart contract codebase for quality, security and correctness. This audit guarantees that your code has been revised by an expert and it’s secure. 

# Issues found 

## Hardcoded address 

The contract contains unknown address. This address might be used for some malicious activity. Please check hardcoded address and it's usage.

### Examples from Chaingear contracts

**Ownable.sol | Line: 45 | Severity: 1**

```solidity

owner = address(0);

```

## Constant functions 

The function is declared as <code> constant </code>. Currently, for functions the <code> constant </code> modifier is a synonym for <code> view </code> (which is the preferred option). Consider using <code> view </code> for funcitons and <code> constant </code> for state variables.

### Examples from Chaingear contracts

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


**StandardToken.sol | Lines: 88 - 92 | Severity: 2**

```solidity

function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

```

## Costly loop

## No payable fallback function 

## Compiler version not fixed

## Reentrancy 

## Timestamp dependance

## Unchecked low-level call 

## Unchecked math

## Implicit visibility level

