// Generated by CoffeeScript 2.2.0
//Import web3
/**
 * Sets the first account as defaultAccount
 * @return {Promise} .then(()->)
 */
var Web3, getDefaultAccount, web3;

Web3 = require('web3');

web3 = window.web3;

if (typeof web3 !== "undefined") {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/m7Pdc77PjIwgmp7t0iKI"));
}

getDefaultAccount = function() {
  return web3.eth.getAccounts().then(function(accounts) {
    return web3.eth.defaultAccount = accounts[0];
  });
};

/**
 * Constructs an abstraction of Betoken contracts
 * @param {String} _address the GroupFund contract's address
 */
export var Betoken = function(_address) {
  var self;
  self = this;
  self.contracts = {
    betokenFund: null,
    controlToken: null
  };
  self.addrs = {
    betokenFund: null,
    controlToken: null
  };
  /*
  Getters
  */
  /**
   * Gets a primitive variable in GroupFund
   * @param  {String} _varName the name of the primitive variable
   * @return {Promise}          .then((_value)->)
   */
  self.getPrimitiveVar = function(_varName) {
    return self.contracts.betokenFund.methods[_varName]().call();
  };
  /**
   * Calls a mapping or an array in GroupFund
   * @param  {String} _name name of the mapping/array
   * @param  {Any} _input       the input
   * @return {Promise}              .then((_value)->)
   */
  self.getMappingOrArrayItem = function(_name, _input) {
    return self.contracts.betokenFund.methods[_name](_input).call();
  };
  /**
   * Calls a double mapping in GroupFund
   * @param  {String} _mappingName name of the mapping
   * @param  {Any} _input1      the first input
   * @param  {Any} _input2      the second input
   * @return {Promise}              .then((_value)->)
   */
  self.getDoubleMapping = function(_mappingName, _input1, _input2) {
    return self.contracts.betokenFund.methods[_mappingName](_input1, _input2).call();
  };
  /**
   * Gets the Kairo balance of an address
   * @param  {String} _address the address whose balance we're getting
   * @return {Promise}          .then((_value)->)
   */
  self.getKairoBalance = function(_address) {
    return self.contracts.controlToken.methods.balanceOf(_address).call();
  };
  self.getKairoTotalSupply = function() {
    return self.contracts.controlToken.methods.totalSupply().call();
  };
  /**
   * Gets an entire array
   * @param  {String} _name name of the array
   * @return {Promise}       .then((_array)->)
   */
  self.getArray = function(_name) {
    var array;
    array = [];
    return self.contracts.betokenFund.methods[`${_name}Count`]().call().then(function(_count) {
      var count, getAllItems, getItem, id;
      count = +_count;
      if (count === 0) {
        return [];
      }
      array = new Array(count);
      getItem = function(id) {
        return self.contracts.betokenFund.methods[_name](id).call().then(function(_item) {
          return new Promise(function(fullfill, reject) {
            if (typeof _item !== null) {
              array[id] = _item;
              fullfill();
            } else {
              reject();
            }
          });
        });
      };
      getAllItems = (function() {
        var i, ref, results;
        results = [];
        for (id = i = 0, ref = count - 1; undefined !== 0 && (0 <= ref ? 0 <= i && i <= ref : 0 >= i && i >= ref); id = 0 <= ref ? ++i : --i) {
          results.push(getItem(id));
        }
        return results;
      })();
      return Promise.all(getAllItems);
    }).then(function() {
      return array;
    });
  };
  /*
  Phase handlers
  */
  /**
   * Ends the current phase
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise} .then(()->)
   */
  self.endPhase = function(_callback) {
    var funcName;
    funcName = null;
    return self.getPrimitiveVar("cyclePhase").then(function(_cyclePhase) {
      _cyclePhase = +_cyclePhase;
      switch (_cyclePhase) {
        case 0:
          return funcName = "endChangeMakingTime";
        case 1:
          return funcName = "endProposalMakingTime";
        case 2:
          return funcName = "finalizeCycle";
        case 3:
          return funcName = "startNewCycle";
      }
    }).then(function() {
      return getDefaultAccount();
    }).then(function() {
      return self.contracts.betokenFund.methods[funcName]().send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /*
  ChangeMakingTime functions
  */
  /**
   * Allows user to deposit into the GroupFund
   * @param  {BigNumber} _amountInWeis the deposit amount
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}               .then(()->)
   */
  self.deposit = function(_amountInWeis, _callback) {
    var funcSignature;
    funcSignature = web3.eth.abi.encodeFunctionSignature("deposit()");
    return getDefaultAccount().then(function() {
      return web3.eth.sendTransaction({
        from: web3.eth.defaultAccount,
        to: self.addrs.betokenFund,
        value: _amountInWeis,
        data: funcSignature
      }).on("transactionHash", _callback);
    });
  };
  /**
   * Allows user to withdraw from GroupFund balance
   * @param  {BigNumber} _amountInWeis the withdrawl amount
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}               .then(()->)
   */
  self.withdraw = function(_amountInWeis, _callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.betokenFund.methods.withdraw(_amountInWeis).send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /**
   * Withdraws all of user's balance in cases of emergency
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}           .then(()->)
   */
  self.emergencyWithdraw = function(_callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.betokenFund.methods.emergencyWithdraw().send({
        from: web3.eth.defaultAccount
      }).on("transactionhash", _callback);
    });
  };
  /**
   * Sends Kairo to another address
   * @param  {String} _to           the recipient address
   * @param  {BigNumber} _amountInWeis the withdrawl amount
   * @param  {Function} _callback     will be called after tx hash is generated
   * @return {Promise}               .then(()->)
   */
  self.sendKairo = function(_to, _amountInWeis, _callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.controlToken.methods.transfer(_to, _amountInWeis).send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /*
  ProposalMakingTime functions
  */
  /**
   * Creates proposal
   * @param  {String} _tokenAddress the token address
   * @param  {String} _tokenSymbol  the token symbol (ticker)
   * @param  {Number} _tokenDecimals the number of decimals the token uses
   * @param  {BigNumber} _stakeInWeis the investment amount
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}               .then(()->)
   */
  self.createProposal = function(_tokenAddress, _tokenSymbol, _tokenDecimals, _stakeInWeis, _callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.betokenFund.methods.createProposal(_tokenAddress, _tokenSymbol, _tokenDecimals, _stakeInWeis).send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /**
   * Stakes for or against a proposal
   * @param  {Integer} _proposalId   the proposal ID
   * @param  {BigNumber} _stakeInWeis the investment amount
   * @param  {Boolean} _support the stance of user
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}               .then(()->)
   */
  self.stakeProposal = function(_proposalId, _stakeInWeis, _support, _callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.betokenFund.methods.stakeProposal(_proposalId, _stakeInWeis, _support).send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /**
   * Cancels user's stake in a proposal
   * @param  {Integer} _proposalId the proposal ID
   * @param  {Function} _callback will be called after tx hash is generated
   * @return {Promise}             .then(()->)
   */
  self.cancelStake = function(_proposalId, _callback) {
    return getDefaultAccount().then(function() {
      return self.contracts.betokenFund.methods.cancelProposalStake(_proposalId).send({
        from: web3.eth.defaultAccount
      }).on("transactionHash", _callback);
    });
  };
  /*
  Object Initialization
  */
  self.init = function() {
    var betokenFundABI;
    //Initialize GroupFund contract
    self.addrs.betokenFund = _address;
    betokenFundABI = require("./abi/BetokenFund.json").abi;
    self.contracts.betokenFund = new web3.eth.Contract(betokenFundABI, self.addrs.betokenFund);
    //Get ControlToken address
    return self.contracts.betokenFund.methods.controlTokenAddr().call().then(function(_controlTokenAddr) {
      var controlTokenABI;
      //Initialize ControlToken contract
      self.addrs.controlToken = _controlTokenAddr;
      controlTokenABI = require("./abi/ControlToken.json").abi;
      return self.contracts.controlToken = new web3.eth.Contract(controlTokenABI, self.addrs.controlToken);
    });
  };
  return self;
};

//# sourceMappingURL=betoken.js.map
