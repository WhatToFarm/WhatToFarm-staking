const { assert, expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Staking tests", async function () {
    let staking, signer, user1, user2, addrPool;

    beforeEach("Deploy the contracts", async function () {
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy();
        await staking.deployed();
        
        Token = await ethers.getContractFactory("TestToken");
        token = await Token.deploy();
        await token.deployed();
        
        await token.approve(staking.address, 1000000);
        await token.mint(2000000);
        
        [signer, user1, user2, addrPool] = await ethers.getSigners();

        await token.transfer(addrPool.address, 1000000);
        await token.connect(addrPool).approve(staking.address, 1000000);
        
        await staking.initialize(token.address, addrPool.address);
    });
    
    describe("Smart contract deployment", async function () {
        it("The right contract creator", async function () {
            assert.equal(await staking.owner(), signer.address);
        });
    });

    describe("Create new stake", async function () {
        it("Not the owner creates new stake", async function () {
            await expect(staking.connect(user1).createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            )).to.be.reverted;
        });

        it("Stake already exist", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await expect(staking.createNewStake(
                "S1", true, false, 15, 15, 262800001, 22, 22
            )).to.be.reverted;
        });

        it("minStakingAmount shouldn't be zero", async function () {
            await expect(staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 0, 20
            )).to.be.reverted;
        });

        it("minStakingAmount shouldn't be less than minWithdrawalAmount", async function () {
            await expect(staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 15, 20
            )).to.be.reverted;
        });

        it("Creating a new stake is correct", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 11, 262800000, 25, 20
            );
            const stakes = await staking.stakes("S1");

            await expect(stakes[0]).to.equal(10);
            await expect(stakes[1]).to.equal(11);
            await expect(stakes[2]).to.equal(25);
            await expect(stakes[3]).to.equal(20);
            await expect(stakes[5]).to.equal(true);
            await expect(stakes[6]).to.equal(false);

            const monthlyEmissions = await staking.viewMonthlyEmission("S1");
            await expect(monthlyEmissions[0]).to.equal(262800000);

            const blockNumNow = await ethers.provider.getBlockNumber();
            const blockNow = await ethers.provider.getBlock(blockNumNow);
            const timestampNow = blockNow.timestamp;

            const emissionTimestamps = await staking.viewEmissionTimestamp("S1");
            await expect(emissionTimestamps[0]).to.equal(timestampNow);
        });
    });

    describe("Enter staking", async function () {
        beforeEach("For user1", async function () {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(staking.address, 1000);
        });

        it("Stake doesn't exist", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await expect(staking.connect(user1).enterStaking("S10", 20)).to.be.reverted;
        });

        it("Stake is inactive", async function () {
            await staking.createNewStake(
                "S1", false, false, 10, 10, 262800000, 20, 20
            );
            await expect(staking.connect(user1).enterStaking("S1", 20)).to.be.reverted;
        });

        it("Not enough tokens for this stake", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await expect(staking.connect(user1).enterStaking("S1", 10)).to.be.reverted;
        });

        it("You are not eligible for this stake", async function () {
            await staking.createNewStake(
                "S1", true, true, 10, 10, 262800000, 20, 20
            );
            await expect(staking.connect(user1).enterStaking("S1", 20)).to.be.reverted;
        });

        it("You are eligible for this privileged stake", async function () {
            await staking.createNewStake(
                "S1", true, true, 10, 10, 262800000, 20, 20
            );
            await staking.setProductsUser([user1.address], [true]);
            await staking.connect(user1).enterStaking("S1", 20);

            const positions = await staking.positions(user1.address, "S1");
            await expect(positions[0]).to.equal(20);
            await expect(await staking.productsUser(user1.address)).to.equal(true);
        });

        it("Entering staking is correct", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await staking.connect(user1).enterStaking("S1", 100);

            const positions = await staking.positions(user1.address, "S1");
            await expect(await token.balanceOf(user1.address)).to.equal(900);
            await expect(positions[0]).to.equal(100);
            await expect(positions[1]).to.equal(100);
        });
    });

    describe("Update stake", async function () {
        beforeEach("Creating a new stake", async function () {
            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
        });

        it("Not the owner updates stake", async function () {
            await expect(staking.connect(user1).updateStake(
                "S1", true, false, 15, 15, 26280000, 30, 30
            )).to.be.reverted;
        });

        it("Stake doesn't exist", async function () {
            await expect(staking.updateStake(
                "S10", true, false, 15, 15, 26280000, 30, 30
            )).to.be.reverted;
        });

        it("minStakingAmount shouldn't be zero", async function () {
            await expect(staking.updateStake(
                "S1", true, false, 15, 15, 26280000, 0, 30
            )).to.be.reverted;
        });

        it("minStakingAmount shouldn't be less than minWithdrawalAmount", async function () {
            await expect(staking.updateStake(
                "S1", true, false, 15, 15, 26280000, 20, 30
            )).to.be.reverted;
        });

        it("Updating a stake is correct", async function () {
            await staking.updateStake(
                "S1", true, false, 5, 6, 262800000, 35, 30
            );
            const stakes = await staking.stakes("S1");
            await expect(stakes[0]).to.equal(5);
            await expect(stakes[1]).to.equal(6);
            await expect(stakes[2]).to.equal(35);
            await expect(stakes[3]).to.equal(30);
            await expect(stakes[5]).to.equal(true);
            await expect(stakes[6]).to.equal(false);

            const monthlyEmissions = await staking.viewMonthlyEmission("S1");
            await expect(monthlyEmissions[0]).to.equal(262800000);

            const blockNumNow = await ethers.provider.getBlockNumber();
            const blockNow = await ethers.provider.getBlock(blockNumNow);
            const timestampNow = blockNow.timestamp;

            const emissionTimestamps = await staking.viewEmissionTimestamp("S1");
            await expect(emissionTimestamps[0]).to.equal(timestampNow - 1); 
        });
    });

    describe("Set reward pool", async function () {
        it("Not the owner sets reward pool", async function() {
            await expect(staking.connect(user2).setRewardPool(addrPool.address)).to.be.reverted;
        });

        it("Set reward pool", async function() {
            await staking.setRewardPool(addrPool.address);
            await expect(await staking.rewardPool()).to.equal(addrPool.address);
        });
    });

    describe("Set products user", async function () {
        it("Not the owner sets products user", async function () {
            await expect(
                staking.connect(user2).setProductsUser([user1.address, user2.address], [true, true]
                )).to.be.reverted;
        });

        it("Doesn't set products user", async function() {
            const setProductsUser = staking.setProductsUser([user1.address, user2.address], [true]);
            await expect(setProductsUser).to.be.reverted;
        });

        it("Setting the products user is correct", async function() {
            await staking.setProductsUser([user1.address, user2.address], [true, true]);
            await expect(await staking.productsUser(user1.address)).to.equal(true);
            await expect(await staking.productsUser(user2.address)).to.equal(true);
        });
    });

    describe("Harvest reward", async function() {
        it("Harvest reward is correct", async function () {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(staking.address, 1000);

            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await staking.connect(user1).enterStaking("S1", 100);
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).harvestReward("S1");

            const positions = await staking.positions(user1.address, "S1");
            await expect(positions[6]).to.equal(10);
            await expect(await token.balanceOf(addrPool.address)).to.equal(999990); // 1000000 - 10
            await expect(await token.balanceOf(user1.address)).to.equal(910); // 900 + 10
        });
    });

    describe("Request leaving", async function () {
        beforeEach("Creating a new stake", async function () {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(staking.address, 1000);

            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await staking.connect(user1).enterStaking("S1", 100);
        });

        it("Position is empty or doesn't exist", async function () {
            await expect(staking.connect(user1).requestLeaving("S2", 100)).to.be.reverted;
        });

        it("More tokens needed to withdraw", async function () {
            await expect(staking.connect(user1).requestLeaving("S1", 5)).to.be.reverted;
        });

        it("Not enough active tokens to request", async function () {
            await expect(staking.connect(user1).requestLeaving("S1", 105)).to.be.reverted;
        });

        it("Your position is still locked up", async function () {
            await network.provider.send("evm_increaseTime", [5]);
            await expect(staking.connect(user1).requestLeaving("S1", 50)).to.be.reverted;
        });

        it("Not enough available tokens to request", async function () {
            await network.provider.send("evm_increaseTime", [10]);
            await expect(staking.connect(user1).requestLeaving("S1", 1000)).to.be.reverted;
        });

        it("Requesting leaving is correct", async function() {
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).requestLeaving("S1", 100);
            const positions = await staking.positions(user1.address, "S1");
            await expect(positions[4]).to.equal(100);
            await expect(positions[1]).to.equal(0);

            const blockNumNow = await ethers.provider.getBlockNumber();
            const blockNow = await ethers.provider.getBlock(blockNumNow);
            const timestampNow = blockNow.timestamp;

            const requestsTimestamp = await staking.viewRequestsTimestamp(user1.address, "S1");
            await expect(requestsTimestamp[0]).to.equal(timestampNow);

            const withdrawalSum = await staking.viewWithdrawalSum(user1.address, "S1");
            await expect(withdrawalSum[0]).to.equal(100);
        });
    });

    describe("Leave staking", async function () {
        beforeEach("Creating and entering a new stake", async function () {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(staking.address, 1000);

            await staking.createNewStake(
                "S1", true, false, 10, 10, 262800000, 20, 20
            );
            await staking.connect(user1).enterStaking("S1", 100);
        });

        it("Position is empty or doesn't exist", async function () {
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).requestLeaving("S1", 100);
            await expect(staking.connect(user1).leaveStaking("S2")).to.be.reverted;
        });

        it("There is no requested tokens to withdraw. After lockup", async function () {
            await network.provider.send("evm_increaseTime", [10]);
            await expect(staking.connect(user1).leaveStaking("S1")).to.be.reverted;
        });

        it("There is no requested tokens to withdraw. Locked up staking", async function () {
            await expect(staking.connect(user1).leaveStaking("S1")).to.be.reverted;
        });

        it("There is no available to withdraw tokens", async function () {
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).requestLeaving("S1", 100);
            await network.provider.send("evm_increaseTime", [5]);
            await expect(staking.connect(user1).leaveStaking("S1")).to.be.reverted;
        });

        it("Leaving staking is correct", async function() {
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).requestLeaving("S1", 100);
            await network.provider.send("evm_increaseTime", [10]);
            await staking.connect(user1).leaveStaking("S1");

            const positions = await staking.positions(user1.address, "S1");
            await expect(positions[5]).to.equal(100);
            await expect(await token.balanceOf(user1.address)).to.equal(1010);
            await expect(await token.balanceOf(staking.address)).to.equal(0);
            await expect(await token.balanceOf(addrPool.address)).to.equal(999990);
        });
    });
});


