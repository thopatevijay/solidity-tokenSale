import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC20Token } from "../typechain-types"

const INITIAL_SUPPLY = 10000;

describe("Basic tests", () => {
    let MyERC20Contract: MyERC20Token;
    let accounts: SignerWithAddress[];

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        const MyERC20ContractFactory = await ethers.getContractFactory("MyERC20Token");
        MyERC20Contract = await MyERC20ContractFactory.deploy(INITIAL_SUPPLY);
        await MyERC20Contract.deployed();
    });
    
    it("should have zero supply at deployment", async () => {
        const totalSupplyBigNumber = await MyERC20Contract.totalSupply();
        const decimals = await MyERC20Contract.decimals();
        const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyBigNumber, decimals));
        expect(totalSupply).to.eq(INITIAL_SUPPLY);
    });

    it("triggers the transfer event with the address of the sender when sending transactions", async () => {
        const senderAddress = accounts[0].address;
        const receiverAddress = accounts[1].address;
        await expect(MyERC20Contract.transfer(receiverAddress,1))
        .to.emit(MyERC20Contract, "Transfer")
        .withArgs(senderAddress, receiverAddress,1);
    });

});