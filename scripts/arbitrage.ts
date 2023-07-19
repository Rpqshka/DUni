import { ChainId, Token } from '@uniswap/sdk';
import { ethers } from "ethers";
import { uniRouter, sushiRouter} from './routers';
import axios from 'axios';

const URL_UNI = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const QUERY_UNI = `
{
    pools(
    first: 15
    orderBy: totalValueLockedETH
    orderDirection: desc
    where: { 
        or: [
            { token0_: { id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" } },
            { token1_: { id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" } }
        ]
    }
    ) {
    id
    token0 {
        id
        name
        symbol
        decimals
    }
    token1 {
        id
        name
        symbol
        decimals
    }
    }
}
`;

const DEX_FEE = 0.003;
const AMOUNT_IN = ethers.parseUnits("1", 18);

let poolAddress: string;
let token: Token;
let weth: Token;


axios.post(URL_UNI, { query: QUERY_UNI })
    .then(async (result) => {
        const pools = result.data.data.pools;
        pools.forEach(pool => {
            poolAddress = pool.id;
            if (pool.token0.symbol == 'WETH') {
                weth = new Token(ChainId.MAINNET, pool.token0.id, pool.token0.decimals, pool.token0.symbol, pool.token0.name);
                token = new Token(ChainId.MAINNET, pool.token1.id, pool.token1.decimals, pool.token1.symbol, pool.token1.name);
            }
            else {
                token = new Token(ChainId.MAINNET, pool.token0.id, pool.token0.decimals, pool.token0.symbol, pool.token0.name);
                weth = new Token(ChainId.MAINNET, pool.token1.id, pool.token1.decimals, pool.token1.symbol, pool.token1.name);
            }
            parsePair(poolAddress, token, weth);
        });
    });


async function parsePair(poolAddress: string, token: Token, weth: Token) {
    const path = [weth.address, token.address];
    let uniAmount;

    try {
        uniAmount = await uniRouter.getAmountsOut(AMOUNT_IN, path);
    } catch (err) {
        console.log(`Sorry Swap Router doesn't work with ${token.symbol} ${token.name} ${token.address} and ${weth.symbol} ${weth.name} ${weth.address} pair`);
        return;
    }

    const sushiAmount = await sushiRouter.getAmountsOut(AMOUNT_IN, path);

    const uniAmountInOriginalPrecision = ethers.formatUnits(uniAmount[1], Number(token.decimals));
    const uniAmountInWETHOriginalPrecision = ethers.formatUnits(uniAmount[0], Number(weth.decimals));
    const sushiAmountInOriginalPrecision = ethers.formatUnits(sushiAmount[1], Number(token.decimals));
    const sushiAmountInWETHOriginalPrecision = ethers.formatUnits(sushiAmount[0], Number(weth.decimals));

    const uniPrice = Number(uniAmountInOriginalPrecision) / Number(uniAmountInWETHOriginalPrecision);
    const sushiPrice = Number(sushiAmountInOriginalPrecision) / Number(sushiAmountInWETHOriginalPrecision);

    let effUniPrice;
    let effSushiPrice;
    let spread;
    let spreadPercentage;

    console.log('---------------------------------------------------');
    console.log('Pool contract address: ', poolAddress);
    console.log(`Token for swap: ${token.symbol} ${token.name} ${token.address}`);
    console.log('uniPrice', uniPrice);
    console.log('sushiPrice', sushiPrice);

    if (uniPrice > sushiPrice) {
        effUniPrice = uniPrice - (uniPrice * DEX_FEE);
        effSushiPrice = sushiPrice - (sushiPrice * DEX_FEE);
        spread = effUniPrice - effSushiPrice;
        spreadPercentage =  ((spread / effSushiPrice) * 100).toFixed(2);
        console.log(`UniSwap to SushiSwap spread: ${spread} in ${token.symbol}, ${spreadPercentage}%`);
        
        if (spread > 0) {
            console.log(`Sell ${weth.symbol} for ${token.symbol} on UniSwap, buy ${weth.symbol} for ${token.symbol} on SushiSwap`);
        } else {
            console.log('No arbitrage opportunity');
        }
    } else if (uniPrice < sushiPrice) {
        effUniPrice = uniPrice - (uniPrice * DEX_FEE);
        effSushiPrice = sushiPrice - (sushiPrice * DEX_FEE);
        spread = effSushiPrice - effUniPrice;
        spreadPercentage = ((spread / effUniPrice) * 100).toFixed(2);
        console.log(`SushiSwap to UniSwap spread: ${spread} in ${token.symbol}, ${spreadPercentage}%`);
        if (spread > 0) {
            console.log(`Sell ${weth.symbol} for ${token.symbol} on SushiSwap, buy ${weth.symbol} for ${token.symbol} on UniSwap`);
        } else {
            console.log('No arbitrage opportunity');
        }
    }
}
