const abiCommon = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint128",
				"name": "amount",
				"type": "uint128"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			}
		],
		"name": "NewStakeCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint128",
				"name": "reward",
				"type": "uint128"
			}
		],
		"name": "RewardHarvested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			}
		],
		"name": "StakeUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint128",
				"name": "amount",
				"type": "uint128"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "stakeName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint128",
				"name": "availableToRequest",
				"type": "uint128"
			}
		],
		"name": "WithdrawRequested",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_active",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "_special",
				"type": "bool"
			},
			{
				"internalType": "uint64",
				"name": "_lockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "_leavingLockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "_monthlyEmission",
				"type": "uint64"
			},
			{
				"internalType": "uint128",
				"name": "_minStakingAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "_minWithdrawalAmount",
				"type": "uint128"
			}
		],
		"name": "createNewStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			},
			{
				"internalType": "uint128",
				"name": "_amount",
				"type": "uint128"
			}
		],
		"name": "enterStaking",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "harvestReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IBEP20",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_rewardPool",
				"type": "address"
			}
		],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "leaveStaking",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			},
			{
				"internalType": "uint128",
				"name": "_amount",
				"type": "uint128"
			}
		],
		"name": "requestLeaving",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_users",
				"type": "address[]"
			},
			{
				"internalType": "bool[]",
				"name": "_set",
				"type": "bool[]"
			}
		],
		"name": "setProductsUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newPool",
				"type": "address"
			}
		],
		"name": "setRewardPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_active",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "_special",
				"type": "bool"
			},
			{
				"internalType": "uint64",
				"name": "_lockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "_leavingLockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "_monthlyEmission",
				"type": "uint64"
			},
			{
				"internalType": "uint128",
				"name": "_minStakingAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "_minWithdrawalAmount",
				"type": "uint128"
			}
		],
		"name": "updateStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IBEP20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "pendingReward",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "positions",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "totalAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "activeAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint64",
				"name": "lastWithdrawalIndex",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "lastAvailableToRequestIndex",
				"type": "uint64"
			},
			{
				"internalType": "uint128",
				"name": "requestedAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "withdrawalAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "receivedReward",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "rewardDebt",
				"type": "uint128"
			},
			{
				"internalType": "uint64",
				"name": "lastUpdateTimestamp",
				"type": "uint64"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "productsUser",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardPool",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "stakes",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "lockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "leavingLockUpPeriod",
				"type": "uint64"
			},
			{
				"internalType": "uint128",
				"name": "minStakingAmount",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "minWithdrawalAmount",
				"type": "uint128"
			},
			{
				"internalType": "bool",
				"name": "exist",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "special",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewAmountSum",
		"outputs": [
			{
				"internalType": "uint128[]",
				"name": "",
				"type": "uint128[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewDepositsTimestamp",
		"outputs": [
			{
				"internalType": "uint64[]",
				"name": "",
				"type": "uint64[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewEmissionTimestamp",
		"outputs": [
			{
				"internalType": "uint64[]",
				"name": "",
				"type": "uint64[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewMonthlyEmission",
		"outputs": [
			{
				"internalType": "uint64[]",
				"name": "",
				"type": "uint64[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewRequestsTimestamp",
		"outputs": [
			{
				"internalType": "uint64[]",
				"name": "",
				"type": "uint64[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_stakeName",
				"type": "string"
			}
		],
		"name": "viewWithdrawalSum",
		"outputs": [
			{
				"internalType": "uint128[]",
				"name": "",
				"type": "uint128[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
