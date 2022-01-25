// Dapp Status Section
const wrapper = document.getElementById('wrapper');
const connect = document.getElementById('connect');

const address = '0x57e6F065A5136a26d47C22d46863B0d7ccB3AE26';

const comments = {
  pendingReward: 'View function to see pending reward tokens on frontend.',
  viewMonthlyEmission: 'Show monthly emissions array of the stake',
  viewEmissionTimestamp: 'Show emission timestamps array of the stake.',
  viewDepositsTimestamp: 'Show deposits timestamps array of the position',
  viewAmountSum: 'Show requested amounts array of the position',
  viewWithdrawTimestamp: 'Show withdraw timestamps array of the position',
  viewRequestsTimestamp: 'Show deposits timestamps array of the position',
  stakes: 'Stakes descriptions',
  positions: 'Info about each user that stakes tokens',
  productsUser: 'Staking products users',
  owner: 'Returns the address of the current owner',
  token: 'The TOKEN',
  rewardPool: 'Reward wallet address',
  createNewStake: 'Create a new stake.',
  updateStake: 'Update existing stake.',
  setRewardPool: 'Change reward pool.',
  enterStaking: 'Stake tokens',
  harvestReward: 'Take all available reward',
  requestLeaving: 'Request leaving from stake, requires Leaving Lock Up Period to wait',
  leaveStaking: 'Withdraw tokens from staking',
  initialize: 'For ERC1967 proxy we need to replace constructor with initialize function',
  setProductsUser: 'Mark users of products as available for special stakes',
  createNewStake: 'Create a new stake',
  updateStake: 'Update existing stake',
  setRewardPool: 'Change the reward pool',
  renounceOwnership: 'Leaves the contract without owner. It will not be possible to call onlyOwner functions anymore. Can only be called by the current owner',
  transferOwnership: 'Transfers ownership of the contract to a new account (newOwner). Can only be called by the current owner',
  upgradeTo: 'Perform implementation upgrade',
  upgradeToAndCall: 'Perform implementation upgrade with additional setup call',
  transferOwnership: 'Transfers ownership of the contract to a new account (newOwner). Can only be called by the current owner',
  implementation: 'Returns the current implementation address',
  owner: 'Returns the address of the current owner',
}

const readForms = {
  pendingReward: [
    'address _user',
    'string calldata _stakeName',
  ],
  viewMonthlyEmission: [
    'string calldata _stakeName',
  ],
  viewEmissionTimestamp: [
    'string calldata _stakeName'
  ],
  viewDepositsTimestamp: [
    'address _user',
    'string calldata _stakeName',
  ],
  viewAmountSum: [
    'address _user',
    'string calldata _stakeName',
  ],
  viewWithdrawalSum: [
    'address _user',
    'string calldata _stakeName',
  ],
  viewRequestsTimestamp: [
    'address _user',
    'string calldata _stakeName',
  ],
  stakes: [
    'string',
  ],
  positions: [
    'address _user',
    'string _stakeName',
  ],
  productsUser: ['address _user'],
  owner: [],
  token: [],
  rewardPool: [],
};

const adminForms = {
  initialize: [
    'BEP20 _token',
    'address _rewardPool',
  ],

  setProductsUser: [
    'address[] calldata _users',
    'bool[] calldata _set',
  ],

  createNewStake: [
    'string memory _stakeName',
    'bool _active',
    'bool _special',
    'uint64 _lockUpPeriod',
    'uint64 _leavingLockUpPeriod',
    'uint64 _monthlyEmission',
    'uint128 _minStakingAmount',
    'uint128 _minWithdrawAmount',
  ],

  updateStake: [
    'string memory _stakeName',
    'bool _active',
    'bool _special',
    'uint64 _lockUpPeriod',
    'uint64 _leavingLockUpPeriod',
    'uint64 _monthlyEmission',
    'uint128 _minStakingAmount',
    'uint128 _minWithdrawAmount',
  ],

  setRewardPool: [
    'address _newPool',
  ],

  renounceOwnership: [
  ],

  transferOwnership: [
    'address newOwner',
  ]
};

const writeForms = {
  enterStaking: [
    'string memory _stakeName',
    'uint128 _amount',
  ],

  harvestReward: [
    'string calldata _stakeName',
  ],

  requestLeaving: [
    'string calldata _stakeName',
    'uint128 _amount',
  ],

  leaveStaking: [
    'string calldata _stakeName'
  ],
};

const proxyAdminForms = {
  upgradeTo: [
    'address newImplementation',
  ],
  upgradeToAndCall: [
    'address newImplementation',
    'bytes memory data',
    'bool forceCall',
  ],
  transferOwnership: [],
};

const proxyReadForms = {
  implementation: [
  ],
  owner: [
  ],
};

const initialize = async () => {
  let accounts = [];

  connect.addEventListener('click', async () => {
    try {
      accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (window.ethereum && accounts.length > 0) {
        wrapper.style.display = 'block';
        connect.style.display = 'none';
      }
      let head = '';
      let section = '';

      head = document.createElement('h1');
      head.innerHTML = 'Write Section';
      wrapper.appendChild(head);

      section = document.createElement('section');
      wrapper.appendChild(section);

      for (let name in writeForms) {
        createFieldset(section, name, writeForms[name], true, abiCommon);
      }

      head = document.createElement('h1');
      head.innerHTML = 'Read Section';
      wrapper.appendChild(head);

      section = document.createElement('section');
      wrapper.appendChild(section);

      for (let name in readForms) {
        createFieldset(section, name, readForms[name], false, abiCommon);
      }

      head = document.createElement('h1');
      head.innerHTML = 'Admin Section';
      wrapper.appendChild(head);

      section = document.createElement('section');
      section.classList.add('admin');
      wrapper.appendChild(section);

      for (let name in adminForms) {
        createFieldset(section, name, adminForms[name], true, abiCommon);
      }

      head = document.createElement('h1');
      head.innerHTML = 'Proxy Owner Section';
      wrapper.appendChild(head);

      section = document.createElement('section');
      wrapper.appendChild(section);

      for (let name in proxyAdminForms) {
        createFieldset(section, name, proxyAdminForms[name], true, abiProxy);
      }

      head = document.createElement('h1');
      head.innerHTML = 'Proxy View Section';
      wrapper.appendChild(head);

      section = document.createElement('section');
      wrapper.appendChild(section);

      for (let name in proxyReadForms) {
        createFieldset(section, name, proxyReadForms[name], false, abiProxy);
      }

    } catch (error) {
      console.error(error);
    }
  });

  const createFieldset = (p, name, inputs, gas, abi) => {
    const fieldset = document.createElement('fieldset');
    p.appendChild(fieldset);

    const heading = document.createElement('h2');
    heading.textContent = name;
    fieldset.appendChild(heading);

    if (comments[name]) {
      const help = document.createElement('span');
      help.classList.add('help');
      help.textContent = '?';
      help.setAttribute('title', comments[name])
      heading.appendChild(help);
    }

    for (let i = 0; i < inputs.length; i++) {
      const input = document.createElement('input');
      input.setAttribute('placeholder', inputs[i]);
      fieldset.appendChild(input);
    }

    const button = document.createElement('button');
    fieldset.appendChild(button);
    button.textContent = 'Read';

    const results = document.createElement('pre');
    fieldset.appendChild(results);

    if (gas) {
      button.textContent = 'Transact';
    }

    web3 = new Web3(ethereum);

    const contract = new web3.eth.Contract(abi, address);

    button.addEventListener('click', async (e) => {
      const params = [];

      button.textContent = button.textContent + '…';

      const fields = fieldset.querySelectorAll('input');
      fields.forEach((field) => {
        if (field.value[0] === '[') {
          params.push(field.value.replaceAll(`'`, `"`));
        } else if (field.value === 'false') {
          params.push(false);
        } else {
          params.push(`'${field.value}'`);
        }
      });

      let response = '';
      results.textContent = response;

      try {
        if (gas) {
          if (name === 'enterStaking') {
            let amount = 0;

            fields.forEach((field) => {
              amount = field.value;
            });

            const contractToken = new web3.eth.Contract(abiToken, '0x3B86874e10b02b115B03e4293fA48C94C1b3dd35');
            const receipt = await contractToken.methods.approve(address, amount).send({
              from: accounts[0],
            });
          }

          response = await eval('contract.methods.' + name + '(' + params.join(',') + ').send({from: accounts[0], to: address})');
        } else {
          response = await eval('contract.methods.' + name + '(' + params.join(',') + ').call()');
        }

        if (typeof response === 'object') {
          for (let k in response) {
            if (!(response instanceof Array) && !isNaN(k)) {
              continue;
            }

            results.textContent += `${k}: ${response[k]}\n`;
          }
        } else {
          results.textContent = response;
        }
      } catch(e) {
        console.log(e);
        results.textContent = JSON.stringify(e, null, 2);
      }

      button.textContent = button.textContent.replace('…', '');
    });
  };

  if (window.ethereum && accounts.length > 0) {
    wrapper.style.display = 'flex';
  }
}

window.addEventListener('DOMContentLoaded', initialize);
