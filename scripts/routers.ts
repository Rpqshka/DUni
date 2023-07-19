import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY);
const uniRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const sushiRouterAddress = '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f';
const routerAbi = [
    'function getAmountsOut(uint amountIn, address[] memory path) internal view returns (uint[] memory amounts)'
];

export const uniRouter = new ethers.Contract(uniRouterAddress, routerAbi, provider); 
export const sushiRouter = new ethers.Contract(sushiRouterAddress, routerAbi, provider); 
