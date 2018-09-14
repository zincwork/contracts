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