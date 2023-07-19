<h1 align="center">DUni</h1>

DUni is an application that uses TheGraph to find the first fifteen pools sorted by totalValueLockedETH, then analyzes the price of tokens in those pairs and looks for the difference in price on UniSwap and SushiSwap.

This script takes into account only  DEX_FEE of 3%, and does not calculate spread with the TX_FEE.

<h3>This is not financial advice</h3>

___

<h2>The Graph</h2>

I used the following [subgraph](https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3)

[![TheGraph.png](https://i.postimg.cc/wMKPPfJW/1.png)](https://postimg.cc/dkB4Z95d)

___

<h2>How to use</h2>

1. Run ``` npx hardhat run scripts/arbitrageChecker.ts ``` in cmd.

2. Script searches for arbitrage opportunities and displays information for each pair in the cmd.

[![2.png](https://i.postimg.cc/qv1CLgCR/2.png)](https://postimg.cc/dhT1Qs6P)

```uniPrice``` - Price of token 0 on UniSwap in token1.
```sushiPrice``` - Price of token 0 on SushiSwap in token1.