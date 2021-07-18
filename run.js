require('dotenv').config();
const Web3 = require('web3');
const abis = require('./abis');
const {mainnet : addresses } = require('./addresses');
// const Telegraf = require('telegraf');
// const bot = new Telegraf(process.env.INSERT_BOT_TOKEN_HERE);

const { ChainId, TokenAmount, Fetcher } = require('@uniswap/sdk');
const web3 = new Web3(
   new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
)

const kyber = new web3.eth.Contract(
    abis.kyber.kyberNetworkProxy,
    addresses.kyber.kyberNetworkProxy
);

web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

//maintain this balance on wallet
const BALANCE_ETH = 10;
const ETH_TICKER_PRICE = 1900;
const BALANCE_ETH_WEI = web3.utils.toWei(BALANCE_ETH.toString());
const BALANCE_DAI_WEI = web3.utils.toWei((BALANCE_ETH * ETH_TICKER_PRICE).toString());

const init = async () => {
    const [dai, weth] = await Promise.all(
        [addresses.tokens.dai, addresses.tokens.weth].map(tokenAddress => (
          Fetcher.fetchTokenData(
            ChainId.MAINNET,
            tokenAddress,
          )
      )));
      const daiWeth = await Fetcher.fetchPairData(
        dai,
        weth,
      );


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

        const uniswapResults = await Promise.all([
            daiWeth.getOutputAmount(new TokenAmount(dai, BALANCE_DAI_WEI)),
            daiWeth.getOutputAmount(new TokenAmount(dai, BALANCE_ETH_WEI))
        ]);

        console.log("uniswap results", uniswapResults)
        const uniswapRates = {
            buy: parseFloat( BALANCE_DAI_WEI / (uniswapResults[0][0].toExact() * 10 ** 18)),
            sell: parseFloat(uniswapResults[1][0].toExact() / BALANCE_ETH),
          };
          console.log('Uniswap ETH/DAI rates', uniswapRates);

          const gasPrice = await web3.eth.getGasPrice();
          console.log(await web3.eth.estimateGas({from: web3.eth.accounts[0], to: "0xEDA8A2E1dfA5B93692D2a9dDF833B6D7DF6D5f93", amount: web3.utils.toWei((1).toString())}))
            const cost = await web3.eth.estimateGas({from: web3.eth.accounts[0], to: "0xEDA8A2E1dfA5B93692D2a9dDF833B6D7DF6D5f93", amount: web3.utils.toWei((1).toString())});
            //update scalar with Web3 estimateGas()
            const txCost = cost * parseInt(gasPrice);
            const currentEthPrice = (uniswapRates.buy + uniswapRates.sell) / 2; 
            const profit1 = (parseInt(BALANCE_ETH_WEI) / 10 ** 18) * (uniswapRates.sell - kyberRates.buy) - (txCost / 10 ** 18) * ETH_TICKER_PRICE;
            const profit2 = (parseInt(BALANCE_ETH_WEI) / 10 ** 18) * (kyberRates.sell - uniswapRates.buy) - (txCost / 10 ** 18) * ETH_TICKER_PRICE;
            if(profit1 > 0) {
                console.log('Kyber Arbitrage -> Uniswap');
                console.log(`Buy ETH on Kyber at ${kyberRates.buy} dai`);
                console.log(`Sell ETH on Uniswap at ${uniswapRates.sell} dai`);
                console.log(`Expected profit: ${profit1} dai`);
            } else if(profit2 > 0) {
                console.log('Kyber Uniswap -> Kyber');
                console.log(`Buy ETH from Uniswap at ${uniswapRates.buy} dai`);
                console.log(`Sell ETH from Kyber at ${kyberRates.sell} dai`);
                console.log(`Expected profit: ${profit2} dai`);
            }
    
    }).on('error', error => {
        console.log("error", error);
    })    
}

init();

