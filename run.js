require('dotenv').config();
const Web3 = require('web3');
const abis = require('./abis');
const {mainnet : addresses } = require('./addresses');
const web3 = new Web3(
   new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
)

const kyber = new web3.eth.Contract(
    abis.kyber.kyberNetworkProxy,
    addresses.kyber.kyberNetworkProxy
);


//maintain this balance on wallet
const BALANCE_ETH = 10;
const ETH_TICKER_PRICE = 1900;
const BALANCE_ETH_WEI = web3.utils.toWei(BALANCE_ETH.toString());
const BALANCE_DAI_WEI = web3.utils.toWei((BALANCE_ETH * ETH_TICKER_PRICE).toString());

web3.eth.subscribe('newBlockHeaders').on('data', async block => {
    console.log(`new block number`, block.number)

    const kyberResults = await Promise.all([
        kyber.methods.getExpectedRate(
            addresses.tokens.dai,
            '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            BALANCE_DAI_WEI
        ).call(),

        kyber.methods.getExpectedRate(
            '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            addresses.tokens.dai,
            BALANCE_DAI_WEI
        ).call()
    ]);
    console.log("kyber results", kyberResults);

    const kyberRates = {
        buy: parseFloat(1 / (kyberResults[0].expectedRate / (10 ** 18))),
        sell: parseFloat(kyberResults[1].expectedRate / (10 ** 18))
    }
    console.log("kyber Eth/dai", kyberRates);

}).on('error', error => {
    console.log("error", error);
})
