const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Profile", function () {
    it("Verifying profile registration/updation", async function () {
        [owner, add1, add2, ...addrs] = await ethers.getSigners();

        // Deploying Profile contract
        Profile = await ethers.getContractFactory("Profile").then(contract => contract.deploy());
        await Profile.deployed(); // contract address = Profile.address

        // Verify name register/update
        await Profile.connect(add1).updateName("Rushank");
        name = await Profile.connect(add1).getter(0);
        console.log(name)
        expect(name).to.equal("Rushank");

        // Verify imgHash register/update
        await Profile.connect(add1).updateImg("0x0123456789");
        img = await Profile.connect(add1).getter(1);
        console.log(img)
        expect(img).to.equal("0x0123456789");

        // Verify bio register/update
        await Profile.connect(add1).updateBio("This is Rushank's bio!");
        bio = await Profile.connect(add1).getter(2);
        console.log(bio)
        expect(bio).to.equal("This is Rushank's bio!");
    })
})