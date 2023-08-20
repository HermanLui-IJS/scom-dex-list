import { BigNumber, TransactionReceipt } from '@ijstech/eth-contract';
import { application } from '@ijstech/components';
import { getRouterSwap, getSwapProxySelectors } from './routerSwap';
import { IDexInfo, IDexType, IDexDetail, IExecuteSwapOptions, IGetDexPairReservesOutput } from './interfaces';
import { getDexPair } from './dexPair';
import { IRpcWallet } from '@ijstech/eth-wallet';
let moduleDir = application.currentModuleDir;

export { IDexInfo, IDexType, IExecuteSwapOptions, IGetDexPairReservesOutput, getSwapProxySelectors };

function fullPath(path: string): string {
    if (path.indexOf('://') > 0)
        return path
    return `${moduleDir}/${path}`
}

export function findDex(dexCode: string) {
    return getDexList().find(d => d.dexCode === dexCode);
}

export function findDexDetail(dexCode: string, chainId: number) {
    const dexInfo = findDex(dexCode);
    if (!dexInfo) return {dexInfo:undefined, dexDetail:undefined}
    const dexDetail: IDexDetail = dexInfo.details.find(d => d.chainId === chainId);
    return {dexInfo, dexDetail}
}

export async function getDexPairReserves(
    wallet: IRpcWallet, 
    chainId: number, 
    dexCode: string, 
    pairAddress: string, 
    tokenInAddress: string, 
    tokenOutAddress: string
) {
    const dexInfo = findDex(dexCode);
    if (!dexInfo) return Promise.reject(new Error('Dex not found'));
    let pair = getDexPair(wallet, dexInfo.dexType, pairAddress);
    let reserves = await pair.getReserves();
    let reserveObj: IGetDexPairReservesOutput;
    if (new BigNumber(tokenInAddress.toLowerCase()).lt(tokenOutAddress.toLowerCase())) {
      reserveObj = {
        reserveA: reserves.reserve0,
        reserveB: reserves.reserve1
      };
    } else {
      reserveObj = {
        reserveA: reserves.reserve1,
        reserveB: reserves.reserve0
      };
    }
    return reserveObj;
}

export async function getRouterSwapTxData(chainId: number, dexCode: string, options: IExecuteSwapOptions): Promise<string> {
    const {dexInfo, dexDetail} = findDexDetail(dexCode,chainId);
    if (!dexInfo || !dexDetail) return Promise.reject(new Error('Dex not found'));
    let txData: string;
    let routerSwap = getRouterSwap(dexInfo.dexType, dexDetail.routerAddress);

    if (options.exactType === 'exactIn') {
        if (options.tokenInType === 'ETH') {
            if (options.feeOnTransfer) {
                txData = await routerSwap.swapExactETHForTokensSupportingFeeOnTransferTokens.txData(options.params, options.txOptions);
            }
            else {
                txData = await routerSwap.swapExactETHForTokens.txData(options.params, options.txOptions);
            }
        }
        else {
            if (options.tokenOutType === 'ETH') {
                if (options.feeOnTransfer) {
                    txData = await routerSwap.swapExactTokensForETHSupportingFeeOnTransferTokens.txData(options.params, options.txOptions);
                }
                else {
                    txData = await routerSwap.swapExactTokensForETH.txData(options.params, options.txOptions);
                }
            }
            else {
                if (options.feeOnTransfer) {
                    txData = await routerSwap.swapExactTokensForTokensSupportingFeeOnTransferTokens.txData(options.params, options.txOptions);
                }
                else {
                    txData = await routerSwap.swapExactTokensForTokens.txData(options.params, options.txOptions);
                }
            }
        }
    }
    else {
        if (options.tokenInType === 'ETH') {
            txData = await routerSwap.swapETHForExactTokens.txData(options.params, options.txOptions);
        }
        else {
            if (options.tokenOutType === 'ETH') {
                txData = await routerSwap.swapTokensForExactETH.txData(options.params, options.txOptions);
            }
            else {
                txData = await routerSwap.swapTokensForExactTokens.txData(options.params, options.txOptions);
            }
        }
    }
    return txData;
}

export async function executeRouterSwap(chainId: number, dexCode: string, options: IExecuteSwapOptions): Promise<TransactionReceipt> {
    const {dexInfo, dexDetail} = findDexDetail(dexCode,chainId);
    if (!dexInfo || !dexDetail) return Promise.reject(new Error('Dex not found'));
    let receipt: TransactionReceipt;
    // await application.loadPackage('@scom/oswap-trader-joe-contract', '*');
    let routerSwap = getRouterSwap(dexInfo.dexType, dexDetail.routerAddress);

    if (options.exactType === 'exactIn') {
        if (options.tokenInType === 'ETH') {
            if (options.feeOnTransfer) {
                receipt = await routerSwap.swapExactETHForTokensSupportingFeeOnTransferTokens(options.params, options.txOptions);
            }
            else {
                receipt = await routerSwap.swapExactETHForTokens(options.params, options.txOptions);
            }
        }
        else {
            if (options.tokenOutType === 'ETH') {
                if (options.feeOnTransfer) {
                    receipt = await routerSwap.swapExactTokensForETHSupportingFeeOnTransferTokens(options.params, options.txOptions);
                }
                else {
                    receipt = await routerSwap.swapExactTokensForETH(options.params, options.txOptions);
                }
            }
            else {
                if (options.feeOnTransfer) {
                    receipt = await routerSwap.swapExactTokensForTokensSupportingFeeOnTransferTokens(options.params, options.txOptions);
                }
                else {
                    receipt = await routerSwap.swapExactTokensForTokens(options.params, options.txOptions);
                }
            }
        }
    }
    else {
        if (options.tokenInType === 'ETH') {
            receipt = await routerSwap.swapETHForExactTokens(options.params, options.txOptions);
        }
        else {
            if (options.tokenOutType === 'ETH') {
                receipt = await routerSwap.swapTokensForExactETH(options.params, options.txOptions);
            }
            else {
                receipt = await routerSwap.swapTokensForExactTokens(options.params, options.txOptions);
            }
        }
    }
    return receipt;
}

export default function getDexList(): IDexInfo[] {
    return [
        {
            dexCode: 'UniswapV2',
            dexName: 'UniswapV2',
            dexType: IDexType.Normal,
            details : [
                {
                    chainId: 1,
                    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                    factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 4,
                    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                    factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 42,
                    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                    factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
            ],
            image: fullPath('/img/uniswap-logo.svg')
        },
        {
            dexCode: 'SushiSwapV2',
            dexName: 'SushiSwapV2',
            dexType: IDexType.Normal,
            details : [
                {
                    chainId: 1,
                    routerAddress: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
                    factoryAddress: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 42,
                    routerAddress: '0x027Bb5f9205360aC628C33508c3f182320A44525',
                    factoryAddress: '0xaDe0ad525430cfe17218B679483c46B6c1d63fe2',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 137,
                    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 43114,
                    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 43113,
                    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 250,
                    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
                {
                    chainId: 42161,
                    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    }
                },
            ],
            image: fullPath('/img/sushiswap-logo.svg')
        }, 
        {
            dexCode: 'OpenSwap',
            dexName: 'OpenSwap',
            dexType: IDexType.Normal,
            details : [
                {
                    chainId: 4,
                    routerAddress: '0x5837a508B429788a576357A4bF78a3e0DA1A684e',
                    factoryAddress: '0x051732011D8b709322C6fC1fE517f68d10Db1b8f',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 42,
                    routerAddress: '0x889460F92f51Cd0c4E66DDc707c267C55823a31b',
                    factoryAddress: '0x13aCdFbbeeB2DcB245BFbf2993FFCe7eeab8dEdB',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {   
                    chainId: 56,
                    routerAddress: '0x50f5679F0CeF71287bD9C7e619960fF9C579661C',
                    factoryAddress: '0x0625468f8F56995Ff1C27EB6FD44ac90E96C5D22',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 97,
                    routerAddress: '0x8AEb7abBCfe0ED8baAfa3ddD2CdE39cDBb4d0106',
                    factoryAddress: '0xDE5CC59535312A8ECCfdB74694C338b6231e490D',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 137,
                    routerAddress: '0x1C2D10aFe50FDf1E334EfBd33604077d55a6d545',
                    factoryAddress: '0x73De9ef746560A1C49b606D08947b42ce527Bd56',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 1287,
                    routerAddress: '0x6d2E47a68B8CA4F18b15c54F8a8A5d12CC7ca871',
                    factoryAddress: '0xB596Aa20F4E947f9A0F5d7154C07677309C308f2',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 1337,
                    routerAddress: '0x31F69F69C8B643546A2a69660763042C7D92a77a',
                    factoryAddress: '0xa5f6e01F5070a80d428320043c03a6fA05aA8F78',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 4002,
                    routerAddress: '0xDcdAFd9461c2df544F6E2165481E8174e45fEbD8',
                    factoryAddress: '0xE0B60F919E6051a5533ffa5B61CF0d5b27cD1cbf',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 43113,
                    routerAddress: '0xc9C6f026E489e0A8895F67906ef1627f1E56860d',
                    factoryAddress: '0x9560fD7C36527001D3Fea2510D405F77cB6AD739',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 43114,
                    routerAddress: '0x56131021109f14E766E96a5E7c1294D351e9dFc5',
                    factoryAddress: '0x667ae7a348610d42d9955d1b43868683a34b1aab',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 13370,
                    routerAddress: '0x4Dd2748168a1B60ea59990E57D70Ae1E7b9958fB',
                    factoryAddress: '0x76c9DB339F5E0C3613bcbD309474B8b7BDf7395e',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 42161,
                    routerAddress: '0x73De9ef746560A1C49b606D08947b42ce527Bd56',
                    factoryAddress: '0xAF541a5cA39A4D2BF067E03431aa287bF81aA33B',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 421613,
                    routerAddress: '0xc441538c208e38C8B8cbc1028dd270049CD73761',
                    factoryAddress: '0x5A9C508ee45d417d176CddADFb151DDC1Fcd21D9',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 31337,
                    routerAddress: '0xE0B60F919E6051a5533ffa5B61CF0d5b27cD1cbf',
                    factoryAddress: '0xF1AFa2C0Df79b9cf7fD40b5670382A04276DAEEF',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 80001,
                    routerAddress: '0xbd1f589480883C171783e1fcD5eD5Fb045bBDF74',
                    factoryAddress: '0x0744B6485dF714A4baBB09a1e9870D84Ad751818',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
                {
                    chainId: 13370,
                    routerAddress: '0x4Dd2748168a1B60ea59990E57D70Ae1E7b9958fB',
                    factoryAddress: '0x76c9DB339F5E0C3613bcbD309474B8b7BDf7395e',
                    tradeFee: {
                        fee: '200',
                        base: '100000'
                    },
                },
            ],
            image: fullPath('/img/openswap.png')
        },
        {
            dexCode: 'PancakeSwapV2',
            dexName: 'PancakeSwapV2',
            dexType: IDexType.Normal,
            details : [
                {
                    chainId: 56,
                    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
                    factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
                    tradeFee: {
                        fee: '25',
                        base: '10000'
                    },
                },
                {
                    chainId: 97,
                    routerAddress: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
                    factoryAddress: '0x6725f303b657a9451d8ba641348b6761a6cc7a17',
                    tradeFee: {
                        fee: '25',
                        base: '10000'
                    },
                },
                {   
                    chainId: 324,
                    routerAddress: '0x5aEaF2883FBf30f3D62471154eDa3C0c1b05942d',
                    factoryAddress: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
                    tradeFee: {
                        fee: '25',
                        base: '10000'
                    },
                },
            ],
            image: fullPath('/img/pancakeswap.svg')
        },
        {
            dexCode: 'PancakeSwapV1',
            dexName: 'PancakeSwapV1',
            dexType: IDexType.Normal,
            details : [
                {   
                    chainId: 56,
                    routerAddress: '0x05ff2b0db69458a0750badebc4f9e13add608c7f',
                    factoryAddress: '0xbcfccbde45ce874adcb698cc183debcf17952812',
                    tradeFee: {
                        fee: '2',
                        base: '1000'
                    },
                },
            ],
            image: fullPath('/img/pancakeswap.svg')
        }, 
        {
            dexCode: 'IFSwapV1',
            dexName: 'IFSwapV1',
            dexType: IDexType.Normal,
            details : [
                {   
                    chainId: 56,
                    routerAddress: '0x8f2A0d8865D995364DC6843D51Cf6989001f989e',
                    factoryAddress: '0x918d7e714243F7d9d463C37e106235dCde294ffC',
                    tradeFee: {
                        fee: '6',
                        base: '10000'
                    },
                },
            ],
            image: fullPath('/img/IFSwapV1.png')
        },    
        {
            dexCode: 'IFSwapV3',
            dexName: 'IFSwapV3',
            dexType: IDexType.IFSwapV3,
            details : [
                {   
                    chainId: 56,
                    routerAddress: '0x56f6ca0a3364fa3ac9f0e8e9858b2966cdf39d03',
                    factoryAddress: '0x4233ad9b8b7c1ccf0818907908a7f0796a3df85f',
                    tradeFee: {
                        fee: '30',
                        base: '10000'
                    },
                },
            ],
            image: fullPath('/img/IFSwapV1.png')
        },        
        {
            dexCode: 'BakerySwap',
            dexName: 'BakerySwap',
            dexType: IDexType.BakerySwap,
            details : [
                {   
                    chainId: 56,
                    routerAddress: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F',
                    factoryAddress: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    },
                },
                {
                    chainId: 97,
                    routerAddress: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F',
                    factoryAddress: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    },
                }
            ],
            image: fullPath('/img/bakeryswap.svg')
        },               
        {
            dexCode: 'Biswap',
            dexName: 'Biswap',
            dexType: IDexType.Normal,
            details : [
                {   
                    chainId: 56,
                    routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
                    factoryAddress: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
                    tradeFee: {
                        fee: '1',
                        base: '1000'
                    },
                },
            ],
            image: fullPath('/img/biswap.svg')            
        },
        {
            dexCode: 'TraderJoe',
            dexName: 'TraderJoe',
            dexType: IDexType.TraderJoe,
            details : [
                {   
                    chainId: 43114,
                    routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
                    factoryAddress: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    },
                },
            ],
            image: fullPath('/img/traderjoe.svg')
        },        
        {
            dexCode: 'Pangolin',
            dexName: 'Pangolin',
            dexType: IDexType.TraderJoe,
            details : [
                {
                    chainId: 43114,
                    routerAddress: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
                    factoryAddress: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    },
                },
                {
                    chainId: 43113,
                    routerAddress: '0x2D99ABD9008Dc933ff5c0CD271B88309593aB921',
                    factoryAddress: '0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd',
                    tradeFee: {
                        fee: '3',
                        base: '1000'
                    },
                },
            ],
            image: fullPath('/img/pangolin.svg')
        }
    ]
}
