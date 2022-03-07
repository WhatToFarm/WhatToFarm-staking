# MARS projects

A Staking project for BEP20 token. Meant to work with ERC1967Proxy.


## PUBLIC FUNCTIONS

### enterStaking

*(string  _stakeName - The name of the Stake*

*uint256 _amount - How many tokens we stake)*

Make new deposit in given Stake for a user

### harvestReward

*(string  _stakeName - The name of the Stake)*

Take all available reward for a user

### requestLeaving

*(string  _stakeName - The name of the Stake*

*uint256 _amount - How many tokens we want to withdraw)*

Request leaving from stake, requires Leaving Lock Up Period to wait before actual leaving

### leaveStaking

*(string  _stakeName - The name of the Stake)*
 
Withdraw all requested tokens from staking


## VIEWERS

### pendingReward

*(address _user - The address of a position user*

*string _stakeName - The name of the Stake)*

View function to see pending reward tokens since the last position update

### stakes

*(string _stakeName - The name of the Stake)*

Information about stake

### positions

*(address _user - The address of a position user*

*string _stakeName - The name of the Stake)*

Information about positions for the specific stake

### productsUser

*(address _user - The address of a user)*

Users who can get access to special stakes

### viewMonthlyEmission

*(string _stakeName - The name of the Stake)*

Show emission timestamps array of the stake.

### viewEmissionTimestamp

*(string _stakeName - The name of the Stake)*

Show emission timestamps array of the stake.

### viewDepositsTimestamp

*(address _user - The address of a position user

*string _stakeName - The name of the Stake)*

Show deposits timestamps array of the position.

### viewAmountSum

*(address _user - The address of a position user*

*string _stakeName - The name of the Stake)*

Show sums of all deposits of the position.

### viewWithdrawalSum

*(address _user - The address of a position user

*string _stakeName - The name of the Stake)*

Show sums of all available to withdraw tokens of the position

### viewRequestsTimestamp

*(address _user - The address of a position user

*string _stakeName - The name of the Stake)*

Show deposits timestamps array of the position

### stakingToken
staking token contract address

### rewardPool
wallet address for reward

### owner
contract owner address


## OWNER'S FUNCTIONS

### createNewStake

*(string _stakeName - The name of the Stake*

*bool _active - To lock and unlock Stake*

*bool _special - Availability for products users*

*uint256 _lockUpPeriod - Lock Up Period for user since enter the Stake*

*uint256 _leavingLockUpPeriod - Additional Lock Up Period for user since Stake withdraw requested*

*uint256 _monthlyEmission - Reward per token per month in 0.01%*

*uint256 _minStakingAmount - Minimal amount to stake*

*uint256 _minWithdrawAmount - Minimal amount to withdraw)*

Creates a new Stake

### updateStake

*(string _stakeName - The name of the Stake*

*bool _active - To lock and unlock Stake*

*bool _special - Availability for products users*

*uint256 _lockUpPeriod - Lock Up Period for user since enter the Stake*

*uint256 _leavingLockUpPeriod - Additional Lock Up Period for user since Stake withdraw requested*

*uint256 _monthlyEmission - Reward per token per month in 0.01%*

*uint256 _minStakingAmount - Minimal amount to stake*

*uint256 _minWithdrawAmount - Minimal amount to withdraw)*

Update existing Stake

### setProductsUser

*(address[]  _users - The array of users to change their status*

*bool[]  _set - The array of new settings)*

Mark users of products as available for special stakes

### setRewardPool

*(address _newPool - The address of a new reward pool)*

Change the reward pool
