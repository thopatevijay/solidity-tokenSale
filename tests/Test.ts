
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { beforeEach } from "mocha";
import { MyERC20Token, TokenSale } from "../typechain-types";

const ERC20_TOKEN_RATION = 5;

describe("NFT Shop", async () => {
    let tokenSaleContract: TokenSale;
    let erc20TokenContract: MyERC20Token;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;

    beforeEach(async () => {
        [deployer, acc1, acc2] = await ethers.getSigners();
        const erc20TokenContractFactory = await ethers.getContractFactory("MyERC20Token");
        erc20TokenContract = await erc20TokenContractFactory.deploy() as MyERC20Token;
        await erc20TokenContract.deployed();
        const tokenSaleContractFactory = await ethers.getContractFactory("TokenSale");
        tokenSaleContract = await tokenSaleContractFactory.deploy(ERC20_TOKEN_RATION, erc20TokenContract.address) as TokenSale;
        await tokenSaleContract.deployed();
        const MINTER_ROLE = await erc20TokenContract.MINTER_ROLE();
        const grantRoleTx = await erc20TokenContract.grantRole(MINTER_ROLE, tokenSaleContract.address);
        await grantRoleTx.wait();
    });

    describe("When the Shop contract is deployed", async () => {
        it("defines the ratio as provided in parameters", async () => {
            const rate = await tokenSaleContract.ratio();
            expect(rate).to.equal(ERC20_TOKEN_RATION);
        });

        it("uses a valid ERC20 as payment token", async () => {
            const paymentTokenAddress = await tokenSaleContract.paymentToken();
            expect(paymentTokenAddress).to.equal(erc20TokenContract.address);
            const erc20TokenContractFactory = await ethers.getContractFactory("MyERC20Token");
            const paymentTokenContract = erc20TokenContractFactory.attach(paymentTokenAddress);
            const myBalance = await paymentTokenContract.balanceOf(deployer.address);
            expect(myBalance).to.eq(0);
            const totalSupply = await paymentTokenContract.totalSupply();
            expect(totalSupply).to.eq(0);
        });
    });

    describe("When a user purchase an ERC20 from the Token contract", () => {
        const amountToBeSentBigN = ethers.utils.parseEther("1");
        beforeEach(async () => {
            const purchaseTokensTx = await tokenSaleContract
                .connect(acc1)
                .purchaseToken({ value: amountToBeSentBigN });
            await purchaseTokensTx.wait();
        });

        it("charges the correct amount of ETH", async () => {
            throw new Error("Not implemented");
        });

        it("gives the correct amount of tokens", async () => {
            const acc1Balance = await erc20TokenContract.balanceOf(acc1.address);
            expect(acc1Balance).to.eq(amountToBeSentBigN.div(5));
        });
    });

});