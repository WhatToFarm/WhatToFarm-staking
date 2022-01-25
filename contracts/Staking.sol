// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Staking
/// @author FormalCrypto

import "./math/SafeMath.sol";
import "./math/SafeMath64.sol";
import "./math/SafeMath128.sol";
import "./token/BEP20/IBEP20.sol";
import "./token/BEP20/SafeBEP20.sol";
import "./access/OwnableInitializable.sol";
import "./utils/Initializable.sol";

/// @notice Implements staking process for IBEP20 token
/// @dev Designed to work with ERC1967Proxy
contract Staking is Ownable, Initializable {
    using SafeMath for uint256;
    using SafeMath128 for uint128;
    using SafeMath64 for uint64;
    using SafeBEP20 for IBEP20;


    /*///////////////////////////////////////////////////////////////
                    Global STATE
    //////////////////////////////////////////////////////////////*/
    
    IBEP20 public stakingToken;
    
    address public rewardPool;
    
    uint128 constant internal MONTH = 365 days / 12;
    
    event ChangeProductUsers(address[] indexed user, bool[] indexed set);
    event NewStake(string indexed stakeName);
    event StakeUpdate(string indexed stakeName);
    event Deposit(address indexed user, string indexed stakeName, uint128 amount);
    event HarvestReward(address indexed user, string indexed stakeName, uint128 reward);
    event RequestWithdraw(address indexed user, string indexed stakeName, uint128 availableToRequest);
    event Withdraw(address indexed user, string indexed stakeName, uint128 amount);
    
    
    /*///////////////////////////////////////////////////////////////
                    DATA STRUCTURES 
    //////////////////////////////////////////////////////////////*/

    // Stakes descriptions.
    mapping (string => StakeInfo) public stakes;
    
    // Information about stake.
    struct StakeInfo {
        // Lock Up Period for user since enter the Stake
        uint64 lockUpPeriod;
        // Additional Lock Up Period for user since Stake withdraw requested
        uint64 leavingLockUpPeriod;
        // Minimal amount to stake
        uint128 minStakingAmount;
        // Minimal amount to withdraw
        uint128 minWithdrawalAmount;
        // State to check the existance
        bool exist;
        // To lock and unlock Stake
        bool active;
        // Availability for products users
        bool special;
        // Array of rewards per token per month in 0.01%
        uint64[] monthlyEmission;
        // Array of timestamps when new emission came
        uint64[] emissionTimestamp;
    }
    
    // Info about each user that stakes tokens.
    mapping (address => mapping (string => PositionInfo)) public positions;
    
    // Information about positions for the specific stake.
    struct PositionInfo {
        // About staked tokens.
        // Total amount tokens in the stake now
        uint128 totalAmount;
        // Amount of rewarded tokens 
        uint128 activeAmount;

        // About withdraw system.
        // Index of the last requested amount with expired leavingLockUpPeriod
        uint64 lastWithdrawalIndex;
        // Index of the last deposit with expired lockUpPeriod
        uint64 lastAvailableToRequestIndex;
        // Amount of tokens requested to withdraw since last the leaving from the stake
        uint128 requestedAmount;
        // Amount that was withdrawn from stake for all the time
        uint128 withdrawalAmount;

        // About reward system.
        // How much reward was already received by user
        uint128 receivedReward;
        // Assigned reward by last position update
        uint128 savedReward;
        // Timestamp of last savedReward update
        uint64 lastUpdateTimestamp;

        // Arrays.
        // When deposit was created
        uint64[] depositsTimestamp;
        // Array of sums of all staked tokens respectif to depositsTimestamp
        uint128[] amountSum;
        // When request happened
        uint64[] requestsTimestamp;
        // Array of sums of all available to withdraw tokens respectif to requestsTimestamp
        uint128[] withdrawalSum;
    }
    
    // Users who can get access to special stakes.
    mapping (address => bool) public productsUser;
    
    
    /*///////////////////////////////////////////////////////////////
                    OWNER'S FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Initilize the contract to start work with it.
    /// @dev For ERC1967 proxy we need to replace constructor with initialize function. Sets staking token, reward pool and an owner of the contract.
    /// @param _stakingToken Address of IBEP20 token contract for staking.
    /// @param _rewardPool Address of a wallet from which we take reward tokens.
    function initialize (
        IBEP20 _stakingToken,
        address _rewardPool
    ) external initializer {
        initializeOwnable();
        stakingToken = _stakingToken;
        rewardPool = _rewardPool;
    }
    
    /// @notice Mark users of products as available for special stakes.
    /// @dev Mark users of products as available for special stakes. Only for owner of the contract.
    /// @param _users The array of users to change their status.
    /// @param _set The array of new settings.
    function setProductsUser(address[] calldata _users, bool[] calldata _set) external onlyOwner {
        require(_users.length == _set.length, "Different size of arrays");
        for (uint256 i = 0; i < _users.length; i++) {
            productsUser[_users[i]] = _set[i];
        }
        emit ChangeProductUsers(_users, _set);
    }
    
    /// @notice Creates a new Stake.
    /// @dev Creates a new Stake. Only for owner of the contract.
    /// @param _stakeName The name of the Stake.
    /// @param _active To lock and unlock Stake.
    /// @param _special Availability for products users.
    /// @param _lockUpPeriod Lock Up Period for user since enter the Stake.
    /// @param _leavingLockUpPeriod Additional Lock Up Period for user since Stake withdraw requested.
    /// @param _monthlyEmission Reward per token per month in 0.01%.
    /// @param _minStakingAmount Minimal amount to stake.
    /// @param _minWithdrawalAmount Minimal amount to withdraw.
    function createNewStake(
        string memory _stakeName,
        bool _active,
        bool _special,
        uint64 _lockUpPeriod,
        uint64 _leavingLockUpPeriod,
        uint64 _monthlyEmission,
        uint128 _minStakingAmount,
        uint128 _minWithdrawalAmount
    ) external onlyOwner {
        StakeInfo storage _stake = stakes[_stakeName];

        require(!_stake.exist, "Stake already exist, use updateStake");
        require(_minStakingAmount != 0, "minStakingAmount shouldnt be zero");
        require(_minStakingAmount >= _minWithdrawalAmount, 
        "minStakingAmount shouldn't be less than minWithdrawalAmount");
        
        _stake.exist = true;
        _stake.active = _active;
        _stake.special = _special;
        _stake.lockUpPeriod = _lockUpPeriod;
        _stake.leavingLockUpPeriod = _leavingLockUpPeriod;
        _stake.monthlyEmission.push(_monthlyEmission);  // in 0,01%
        _stake.emissionTimestamp.push(uint64(block.timestamp));
        _stake.minStakingAmount = _minStakingAmount;
        _stake.minWithdrawalAmount = _minWithdrawalAmount;

        emit NewStake(_stakeName);
    }
    
    /// @notice Update existing Stake.
    /// @dev Update existing Stake. Only for owner of the contract.
    /// @param _stakeName The name of the Stake.
    /// @param _active To lock and unlock Stake.
    /// @param _special Availability for products users.
    /// @param _lockUpPeriod Lock Up Period for user since enter the Stake.
    /// @param _leavingLockUpPeriod Additional Lock Up Period for user since Stake withdraw requested.
    /// @param _monthlyEmission Reward per token per month in 0.01%.
    /// @param _minStakingAmount Minimal amount to stake.
    /// @param _minWithdrawalAmount Minimal amount to withdraw.
    function updateStake(
        string memory _stakeName,
        bool _active,
        bool _special,
        uint64 _lockUpPeriod,
        uint64 _leavingLockUpPeriod,
        uint64 _monthlyEmission,
        uint128 _minStakingAmount,
        uint128 _minWithdrawalAmount
    ) external onlyOwner {
        StakeInfo storage _stake = stakes[_stakeName];

        require(_stake.exist, "Stake doesnt exist, use createNewStake");
        require(_minStakingAmount != 0, "minStakingAmount shouldnt be zero");
        require(_minStakingAmount >= _minWithdrawalAmount, 
        "minStakingAmount shouldn't be less than minWithdrawalAmount");
        
        _stake.active = _active;
        _stake.special = _special;
        _stake.lockUpPeriod = _lockUpPeriod;
        _stake.leavingLockUpPeriod = _leavingLockUpPeriod;
        _stake.monthlyEmission.push(_monthlyEmission);  // in 0,01%
        _stake.emissionTimestamp.push(uint64(block.timestamp));
        _stake.minStakingAmount = _minStakingAmount;
        _stake.minWithdrawalAmount = _minWithdrawalAmount;

        emit StakeUpdate(_stakeName);
    }
    
    /// @notice Change the reward pool.
    /// @dev Change the reward pool. Only for owner of the contract.
    /// @param _newPool The address of a new reward pool.
    function setRewardPool(address _newPool) external onlyOwner {
        rewardPool = _newPool;
    }
    

    /*///////////////////////////////////////////////////////////////
                    PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Stake tokens.
    /// @dev Make new deposit in given Stake for a user.
    /// @param _stakeName The name of the Stake.
    /// @param _amount How many tokens we stake.
    function enterStaking(string memory _stakeName, uint128 _amount) external {
        StakeInfo storage _stake = stakes[_stakeName];
        require(_stake.exist, "Stake doesnt exist");
        require(_stake.active, "Stake is inactive");
        require(_amount >= _stake.minStakingAmount, "Not enough tokens for this stake");
        require(productsUser[msg.sender] || !_stake.special, 
        "You are not eligible for this stake");
        
        PositionInfo storage position = positions[msg.sender][_stakeName];

        // Update reward debt if it's not the fist deposit in position.
        if (position.lastUpdateTimestamp != 0) {
            position.savedReward = position.savedReward.add(
                _pendingReward(_stakeName, position.activeAmount, position.lastUpdateTimestamp)
                );
        }
        position.activeAmount = position.activeAmount.add(_amount);
        position.totalAmount = position.totalAmount.add(_amount);

        // Set last update time.
        position.lastUpdateTimestamp = uint64(block.timestamp);
        
        // Update deposits history.
        position.depositsTimestamp.push(uint64(block.timestamp));
        if (position.amountSum.length == 0) position.amountSum.push(_amount);
        else position.amountSum.push(position.amountSum[position.amountSum.length.sub(1)].add(_amount));

        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        emit Deposit(msg.sender, _stakeName, _amount);
    }

    /// @notice Take all available reward.
    /// @dev Take all available reward for a user.
    /// @param _stakeName The name of the Stake.
    function harvestReward(string calldata _stakeName) public {
        PositionInfo storage position = positions[msg.sender][_stakeName];

        // Calculate the reward.
        uint128 _reward = position.savedReward.add(
            _pendingReward(_stakeName, position.activeAmount, position.lastUpdateTimestamp)
            );

        // Clear reward debt.
        position.savedReward = 0;
        // Set last update time.
        position.lastUpdateTimestamp = uint64(block.timestamp);
        // Update received reward for history.
        position.receivedReward = position.receivedReward.add(_reward);
        
        stakingToken.safeTransferFrom(rewardPool, msg.sender, _reward);
        
        emit HarvestReward(msg.sender, _stakeName, _reward);
    }

    /// @notice Request leaving from stake, requires Leaving Lock Up Period to wait before actual leaving.
    /// @dev Request leaving from stake, requires Leaving Lock Up Period to wait before actual leaving.
    /// @param _stakeName The name of the Stake.
    /// @param _amount How many tokens we want to withdraw.
    function requestLeaving(string calldata _stakeName, uint128 _amount) external {
        PositionInfo storage position = positions[msg.sender][_stakeName];
        StakeInfo memory _stake = stakes[_stakeName];
        
        require(position.totalAmount > 0, "Position is empty or doesnt exist");
        // We should exceed minimum threshold or scrap position tailing.
        require(_amount >= _stake.minWithdrawalAmount 
            || position.totalAmount < _stake.minWithdrawalAmount, 
            "More tokens needed to withdraw");
        require(position.activeAmount >= _amount, "Not enough active tokens to request");

        // Check the available amount of tokens to withdraw and update that number.
        uint128 _availableForRequest = allAvailableForRequest(msg.sender, _stakeName).sub(position.requestedAmount);
        require(_availableForRequest > 0, "Your position is still locked up");
        require(_availableForRequest >= _amount, "Not enough available tokens to request");

        // Save pending reward
        position.savedReward = position.savedReward.add(
            _pendingReward(_stakeName, position.activeAmount, position.lastUpdateTimestamp)
            );
        // Set last update time.
        position.lastUpdateTimestamp = uint64(block.timestamp);
        // Stop getting reward for requested amount.
        position.activeAmount = position.activeAmount.sub(_amount);

        // Increase requestedAmount.
        position.requestedAmount = position.requestedAmount.add(_amount);
        // New sum for all the time of available to withdraw tokens 
        uint256 len = position.withdrawalSum.length;
        if (len == 0) position.withdrawalSum.push(_amount);
        else position.withdrawalSum.push(
            position.withdrawalSum[len.sub(1)].add(_amount)
            );

        position.requestsTimestamp.push(uint64(block.timestamp));
        
        emit RequestWithdraw(msg.sender, _stakeName, _amount);
    }

    /// @notice Withdraw all requested tokens from staking.
    /// @dev Withdraw all requested tokens from staking.
    /// @param _stakeName The name of the Stake.
    function leaveStaking(string calldata _stakeName) external {
        PositionInfo storage position = positions[msg.sender][_stakeName];
        
        require(position.totalAmount > 0, "Position is empty or doesnt exist");
        require(position.requestedAmount > 0, "There is no requested tokens to withdraw.");

        // Take reward.
        harvestReward(_stakeName);

        // Calculate amount to withdraw
        // as requested to withdraw tokens for all the time
        // minus withdrawn tokens for all the time.
        uint128 _payback = pendingPayback(msg.sender, _stakeName).sub(position.withdrawalAmount);

        require(_payback > 0, "There is no available to withdraw tokens.");

        // Update position amount.
        position.totalAmount = position.totalAmount.sub(_payback);
        // Increase withdrawalAmount.
        position.withdrawalAmount = position.withdrawalAmount.add(_payback);
        
        // Send tokens to user.
        stakingToken.safeTransfer(msg.sender, _payback);
        
        emit Withdraw(msg.sender, _stakeName, _payback);
    }
    
    
    /*///////////////////////////////////////////////////////////////
                    VIEWERS
    //////////////////////////////////////////////////////////////*/

    /// @notice View function to see pending reward tokens since the last position update.
    /// @dev In sum with savedReward becomes total pending reward of a user.
    /// @param _user The address of a position user.
    /// @param _stakeName The name of the Stake.
    /// @return The amount of pending reward tokens since the last position update.
    function pendingReward(address _user, string calldata _stakeName) external view returns (uint128) {
        uint128 _reward = _pendingReward(_stakeName, positions[_user][_stakeName].activeAmount,
                                positions[_user][_stakeName].lastUpdateTimestamp);
        
        return _reward;
    }

    /// @notice Show monthly emissions array of the stake.
    /// @dev Show monthly emissions array of the stake. Not available directly from stake struct.
    /// @param _stakeName The name of the Stake.
    /// @return The monthly emissions array of the stake.
    function viewMonthlyEmission(string calldata _stakeName) external view returns (uint64[] memory) {
        return stakes[_stakeName].monthlyEmission;
    }

    /// @notice Show emission timestamps array of the stake.
    /// @dev Show emission timestamps array of the stake. Not available directly from stake struct.
    /// @param _stakeName The name of the Stake.
    /// @return The emissions timestamps array of the stake.
    function viewEmissionTimestamp(string calldata _stakeName) external view returns (uint64[] memory) {
        return stakes[_stakeName].emissionTimestamp;
    }

    /// @notice Show deposits timestamps array of the position.
    /// @dev Show deposits timestamps array of the position. Not available directly from position struct.
    /// @param _user The address of a position user.
    /// @param _stakeName The name of the Stake.
    /// @return The deposits timestamps array of the position.
    function viewDepositsTimestamp(address _user, string calldata _stakeName) external view returns (uint64[] memory) {
        PositionInfo memory position = positions[_user][_stakeName];
        
        return position.depositsTimestamp;
    }

    /// @notice Show sums of all deposits of the position.
    /// @dev Show sums of all deposits of the position. Not available directly from position struct.
    /// @param _user The address of a position user.
    /// @param _stakeName The name of the Stake.
    /// @return The array of sums of all deposits of the position.
    function viewAmountSum(address _user, string calldata _stakeName) external view returns (uint128[] memory) {
        PositionInfo memory position = positions[_user][_stakeName];
        
        return position.amountSum;
    }

    /// @notice Show sums of all available to withdraw tokens of the position.
    /// @dev Show sums of all available to withdraw tokens of the position. Not available directly from position struct.
    /// @param _user The address of a position user.
    /// @param _stakeName The name of the Stake.
    /// @return The array of sums of all available to withdraw tokens of the position.
    function viewWithdrawalSum(address _user, string calldata _stakeName) external view returns (uint128[] memory) {
        PositionInfo memory position = positions[_user][_stakeName];
        
        return position.withdrawalSum;
    }

    /// @notice Show deposits timestamps array of the position.
    /// @dev Show deposits timestamps array of the position. Not available directly from position struct.
    /// @param _user The address of a position user.
    /// @param _stakeName The name of the Stake.
    /// @return The deposits timestamps array of the position.
    function viewRequestsTimestamp(address _user, string calldata _stakeName) external view returns (uint64[] memory) {
        PositionInfo memory position = positions[_user][_stakeName];
        
        return position.requestsTimestamp;
    }

    
    /*///////////////////////////////////////////////////////////////
                    INTERNAL  HELPERS
    //////////////////////////////////////////////////////////////*/
    
    // Reward calculation.
    function _pendingReward (
        string memory _stakeName, 
        uint128 _amount, 
        uint64 _startTime) 
    private view returns (uint128) {
        StakeInfo memory _stake = stakes[_stakeName];
        
        uint128 _reward = 0;
        uint64 _period = 0;

        uint64 start = _startTime;
        uint64 _emission = _stake.monthlyEmission[0];
        // Iterating through small array with few elements (usually one)
        for (uint64 i = 0; i < _stake.emissionTimestamp.length; i++) {
            // skip emission changes before pending period
            if (_stake.emissionTimestamp[i] < _startTime) {
                _emission = _stake.monthlyEmission[i];
                continue;
            }

            _period = _stake.emissionTimestamp[i].sub(start);
            _reward = _reward.add(
                _evaluateReward(_amount, _emission, _period)
            );

            // save for the next iterations
            start = _stake.emissionTimestamp[i];
            _emission = _stake.monthlyEmission[i];
        }

        // for the last period
        _period = uint64(block.timestamp).sub(start);
        _reward = _reward.add(
                _evaluateReward(_amount, _emission, _period)
            );

        return _reward;
    }

    // Reward calculation for single case.
    function _evaluateReward(uint128 _amount, uint128 _emission, uint64 _time) private pure returns (uint128) {
        // Calculation pending Reward by following:
        // (monthly emission in 0.01% * staked tokens * staked time) / (month * 100.00 %)
        return _emission.mul(_amount).mul(uint128(_time)).div(MONTH.mul(10000));
    }    

    // Find available to request for withdraw tokens from the stake for all the time 
    // and update lastAvailableToRequestIndex to save gas next time.
    function allAvailableForRequest(address _user, string calldata _stakeName) private returns (uint128) {
        PositionInfo storage position = positions[_user][_stakeName];
        uint64 _lockUpPeriod = stakes[_stakeName].lockUpPeriod;

        uint128 _totalAvailable = 0;
        // Search from the last update.
        uint64 ind = find(position.depositsTimestamp, position.lastAvailableToRequestIndex, 
            uint64(position.depositsTimestamp.length.sub(1)), uint64(block.timestamp).sub(_lockUpPeriod));
        
        // Locked single deposit case
        if(ind == 0 && uint64(block.timestamp).sub(_lockUpPeriod) < position.depositsTimestamp[ind])
            _totalAvailable = 0;
        else _totalAvailable = position.amountSum[ind];

        position.lastAvailableToRequestIndex = ind;

        return _totalAvailable;
    }

    // Find available to withdraw tokens from the stake for all the time 
    // and update lastWithdrawalIndex to save gas next time.
    function pendingPayback(address _user, string calldata _stakeName) private returns (uint128) {
        PositionInfo storage position = positions[_user][_stakeName];
        uint64 _leavingLockUpPeriod = stakes[_stakeName].leavingLockUpPeriod;

        uint128 _payback = 0;
        // Search from the last update.
        uint64 ind = find(position.requestsTimestamp, position.lastWithdrawalIndex, 
            uint64(position.requestsTimestamp.length.sub(1)), uint64(block.timestamp).sub(_leavingLockUpPeriod));

        // Locked single deposit case
        if(ind == 0 && uint64(block.timestamp).sub(_leavingLockUpPeriod) < position.requestsTimestamp[ind])
            _payback = 0;
        else _payback = position.withdrawalSum[ind];

        position.lastWithdrawalIndex = ind;

        return _payback;
    }

    // Binary search in the data for a lower bound of a smallest interval containing the value.
    function find(uint64[] storage data, uint64 begin, uint64 end, uint64 value) internal returns (uint64 ret) {
        uint64 len = end.sub(begin);
        if (len == 0)
            return begin;
        
        uint64 mid = begin.add(len >> 2);
        if (len == 1)
            mid = mid.add(1);
        
        uint64 v = data[mid];
        if (value < v) {
            if (len == 1) return begin;
            return find(data, begin, mid, value);
        }   
        else if (value > v) 
            return find(data, mid, end, value);
        else
            return mid;
    }
}
