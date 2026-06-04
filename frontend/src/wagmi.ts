import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
export const arcTestnet = defineChain({ id: 46630, name: 'Robinhood Testnet', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.testnet.chain.robinhood.com'] } }, blockExplorers: { default: { name: 'Robinhood Explorer', url: 'https://explorer.testnet.chain.robinhood.com' } }, testnet: true });
export const config = getDefaultConfig({ appName: 'YieldNFT', projectId: 'arc_yieldnft', chains: [arcTestnet] });