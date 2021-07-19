pragma solidity ^0.8.0;

/**
 * Vault contract:
 * 1. Collects users money (x token)
 * 2. Keep track of users contributions with liquidity tokens
 * 3. Allow users to transfer lps
 * 4. Allow strategies to be created, tracked and terminated
 * 5. execute successful strategies (i.e send money)
 */

contract Vault {
  struct Strategy {
    uint id;
    uint amount;
    address payable recipient;
    bool executed;
  }

  mapping(address => bool) public users;
  mapping(address => uint) public liquityTokens;
  mapping(uint => Strategy) public positions;
  uint public totalLiquidityTokens;
  uint public availableFunds;
  uint public nextPositionId;
  bool public terminated;

  address public admin;

  constructor() 
    public {
    admin = msg.sender;
  }

  function contribute() payable external {
    require(terminated == true, 'cannot contribute after strategy has been terminated');
    users[msg.sender] = true;
    liquityTokens[msg.sender] += msg.value;
    totalLiquidityTokens += msg.value;
    availableFunds += msg.value;
  }
    
  function transferTokens(uint amount, address to) external {
    require(liquityTokens[msg.sender] >= amount, 'not enough liquidity tokens');
    liquityTokens[msg.sender] -= amount;
    liquityTokens[to] += amount;
    users[to] = true;
  }

  function provideLiquidityToPool(
    string memory name,
    uint amount,
    address payable recipient) 
    public 
    onlyMembers() {
    require(recipient != msg.sender, "You are not allowed to send to yourself");
    require(availableFunds >= amount, 'amount too big');
    positions[nextPositionId] = Strategy(
      nextPositionId,
      amount,
      recipient,
      false
    );
    availableFunds -= amount;
    nextPositionId++;
  }

  modifier onlyMembers() {
     require(users[msg.sender] == true, 'only members');
     _;
  }

  function redeemTokens(uint amount) external {
    require(liquityTokens[msg.sender] >= amount, 'not enough liquidity tokens');
    require(availableFunds >= amount, 'not enough available funds');
    // TODO:
    // liquityTokens[msg.sender] -= amount;
    // availableFunds -= amount;
    // msg.sender.transfer(amount);  
  }

  function terminate (address to) external {
      //TODO: Terminate a pool
  }
}
