
const Tether = artifacts.require('Tether')
const RWD = artifacts.require('RWD')
const DecentralBank = artifacts.require('DecentralBank')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank', ([owner, customer]) => {
    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before (async () => {
        // Load contracts
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        // Transfer all tokens to DecentralBank (1million)
        await rwd.transfer(decentralBank.address, tokens('1000000'))

        // Transfer 100 Mock Tethers to Customer
        await tether.transfer(customer, tokens('100'), {from: owner})
    })
    describe('Mock Tether Deployment', async () => {
        it ('matches names successfully', async () => {
            const name = await tether.name()
            assert.equal(name, 'Tether')
        })
    })

    describe('Reward Token Deployment', async () => {
        it ('matches names successfully', async () => {
            const name = await rwd.name()
            assert.equal(name, 'Reward Token')
        })
    })

    describe('Decentral Bank Deployment', async () => {
        it ('matches names successfully', async () => {
            const name = await decentralBank.name()
            assert.equal(name, 'Decentral Bank')
        })

        it ('contract has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('1000000'))
        })
    describe('Yield Farming' , async () => {
        it('rewards tokens for staking' , async() => {
            let result

        // Check investor balance
        result = await tether.balanceOf(customer)
        assert.equal(result.toString() , tokens('100') , 'customer mock wallet balance before staking')
       
        //Check staking for customer of 100 tokens
        await tether.approve(decentralBank.address , tokens('100') , {from : customer})
        await decentralBank.depositTokens(tokens('100') , {from: customer})

        //Check updated balance of customer
        result = await tether.balanceOf(customer)
        assert.equal(result.toString() , tokens('0') , 'customer mock wallet balance after staking 100 tokens')

        //Check updated balance of Decentral Bank
        result = await tether.balanceOf(decentralBank.address)
        assert.equal(result.toString() , tokens('100') , 'decentral bank mock wallet balance after staking from customer')

         // Is staking Balance
         result = await decentralBank.isStaking(customer)
         assert.equal(result.toString(), 'true' ,  'Customer is staking status after staking')

         // Issue tokens
         await decentralBank.issueTokens({from: owner})

         // Ensure only the owner can issue tokens
         await decentralBank.issueTokens({from: customer}).should.be.rejected;

         // unstake tokens
         await decentralBank.unstakeTokens({from: customer})

         // Check Unstaking balances

        result = await tether.balanceOf(customer)
        assert.equal(result.toString() , tokens('100') , 'customer mock wallet balance after unstaking 100 tokens')

        //Check updated balance of Decentral  Bank
        result = await tether.balanceOf(decentralBank.address)
        assert.equal(result.toString() , tokens('0') , 'decentral bank mock wallet balance after staking from customer')

         // Is staking Update
         result = await decentralBank.isStaking(customer)
         assert.equal(result.toString(), 'false' ,  'Customer is no longer staking status after unstaking')
        })
    })
    })

    
})