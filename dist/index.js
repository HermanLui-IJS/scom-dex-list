define("@scom/scom-dex-list/interfaces.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDexType = void 0;
    var IDexType;
    (function (IDexType) {
        IDexType["Normal"] = "Normal";
        IDexType["BakerySwap"] = "BakerySwap";
        IDexType["TraderJoe"] = "TraderJoe";
        IDexType["IFSwapV3"] = "IFSwapV3";
    })(IDexType = exports.IDexType || (exports.IDexType = {}));
});
define("@scom/scom-dex-list/routerSwap.ts", ["require", "exports", "@scom/oswap-openswap-contract", "@scom/oswap-bakery-swap-contract", "@scom/oswap-trader-joe-contract", "@ijstech/eth-wallet", "@scom/scom-dex-list/interfaces.ts"], function (require, exports, oswap_openswap_contract_1, oswap_bakery_swap_contract_1, oswap_trader_joe_contract_1, eth_wallet_1, interfaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSwapProxySelectors = exports.getRouterSwap = exports.TraderJoeRouterSwap = exports.BakerySwapRouterSwap = exports.NormalRouterSwap = exports.RouterSwap = void 0;
    class RouterSwap {
        constructor(router) {
            this.router = router;
        }
    }
    exports.RouterSwap = RouterSwap;
    class NormalRouterSwap extends RouterSwap {
        constructor(router) {
            super(router);
            this.PermittedProxyFunctions = [
                "swapExactTokensForTokens",
                "swapTokensForExactTokens",
                "swapExactETHForTokens",
                "swapTokensForExactETH",
                "swapExactTokensForETH",
                "swapETHForExactTokens"
            ];
            this.swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactETHForTokensSupportingFeeOnTransferTokens;
            this.swapExactETHForTokens = this.router.swapExactETHForTokens;
            this.swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForETHSupportingFeeOnTransferTokens;
            this.swapExactTokensForETH = this.router.swapExactTokensForETH;
            this.swapExactTokensForTokensSupportingFeeOnTransferTokens = this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens;
            this.swapExactTokensForTokens = this.router.swapExactTokensForTokens;
            this.swapETHForExactTokens = this.router.swapETHForExactTokens;
            this.swapTokensForExactETH = this.router.swapTokensForExactETH;
            this.swapTokensForExactTokens = this.router.swapTokensForExactTokens;
        }
    }
    exports.NormalRouterSwap = NormalRouterSwap;
    class BakerySwapRouterSwap extends NormalRouterSwap {
        constructor(router) {
            super(router);
            this.PermittedProxyFunctions = [
                "swapExactTokensForTokens",
                "swapTokensForExactTokens",
                "swapExactBNBForTokens",
                "swapTokensForExactBNB",
                "swapExactTokensForBNB",
                "swapBNBForExactTokens"
            ];
            this.swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactBNBForTokensSupportingFeeOnTransferTokens;
            this.swapExactETHForTokens = this.router.swapExactBNBForTokens;
            this.swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForBNBSupportingFeeOnTransferTokens;
            this.swapExactTokensForETH = this.router.swapExactTokensForBNB;
            this.swapETHForExactTokens = this.router.swapBNBForExactTokens;
            this.swapTokensForExactETH = this.router.swapTokensForExactBNB;
        }
    }
    exports.BakerySwapRouterSwap = BakerySwapRouterSwap;
    class TraderJoeRouterSwap extends NormalRouterSwap {
        constructor(router) {
            super(router);
            this.PermittedProxyFunctions = [
                "swapExactTokensForTokens",
                "swapTokensForExactTokens",
                "swapExactAVAXForTokens",
                "swapTokensForExactAVAX",
                "swapExactTokensForAVAX",
                "swapAVAXForExactTokens"
            ];
            this.swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactAVAXForTokensSupportingFeeOnTransferTokens;
            this.swapExactETHForTokens = this.router.swapExactAVAXForTokens;
            this.swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForAVAXSupportingFeeOnTransferTokens;
            this.swapExactTokensForETH = this.router.swapExactTokensForAVAX;
            this.swapETHForExactTokens = this.router.swapAVAXForExactTokens;
            this.swapTokensForExactETH = this.router.swapTokensForExactAVAX;
        }
    }
    exports.TraderJoeRouterSwap = TraderJoeRouterSwap;
    function getRouterSwap(dexType, routerAddress) {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        let routerSwap;
        if (dexType === interfaces_1.IDexType.BakerySwap) {
            const router = new oswap_bakery_swap_contract_1.Contracts.BakerySwapRouter(wallet, routerAddress);
            routerSwap = new BakerySwapRouterSwap(router);
        }
        else if (dexType === interfaces_1.IDexType.TraderJoe) {
            const router = new oswap_trader_joe_contract_1.Contracts.JoeRouter02(wallet, routerAddress);
            routerSwap = new TraderJoeRouterSwap(router);
        }
        else {
            const router = new oswap_openswap_contract_1.Contracts.OSWAP_Router(wallet, routerAddress);
            routerSwap = new NormalRouterSwap(router);
        }
        return routerSwap;
    }
    exports.getRouterSwap = getRouterSwap;
    async function getSwapProxySelectors(dexType, chainId, routerAddress) {
        let routerSwap;
        let router;
        let wallet = eth_wallet_1.RpcWallet.getRpcWallet(chainId);
        if (dexType === interfaces_1.IDexType.BakerySwap) {
            router = new oswap_bakery_swap_contract_1.Contracts.BakerySwapRouter(wallet, routerAddress);
            routerSwap = new BakerySwapRouterSwap(router);
        }
        else if (dexType === interfaces_1.IDexType.TraderJoe) {
            router = new oswap_trader_joe_contract_1.Contracts.JoeRouter02(wallet, routerAddress);
            routerSwap = new TraderJoeRouterSwap(router);
        }
        else {
            router = new oswap_openswap_contract_1.Contracts.OSWAP_Router(wallet, routerAddress);
            routerSwap = new NormalRouterSwap(router);
        }
        let selectors = routerSwap.PermittedProxyFunctions
            .map(e => e + "(" + router._abi.filter(f => f.name == e)[0].inputs.map(f => f.type).join(',') + ")")
            .map(e => wallet.soliditySha3(e).substring(0, 10))
            .map(e => router.address.toLowerCase() + e.replace("0x", ""));
        return selectors;
    }
    exports.getSwapProxySelectors = getSwapProxySelectors;
});
define("@scom/scom-dex-list/dexPair.ts", ["require", "exports", "@scom/oswap-openswap-contract", "@scom/oswap-impossible-swap-contract", "@scom/scom-dex-list/interfaces.ts"], function (require, exports, oswap_openswap_contract_2, oswap_impossible_swap_contract_1, interfaces_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseSwapEvents = exports.getDexPair = exports.IFSwapV3Pair = exports.NormalDexPair = exports.DexPair = void 0;
    class DexPair {
        constructor(pair) {
            this.pair = pair;
        }
    }
    exports.DexPair = DexPair;
    class NormalDexPair extends DexPair {
        constructor(pair) {
            super(pair);
            this.getReserves = this.pair.getReserves;
        }
    }
    exports.NormalDexPair = NormalDexPair;
    class IFSwapV3Pair extends DexPair {
        constructor(pair) {
            super(pair);
            this.getReserves = this.pair.getReserves;
        }
    }
    exports.IFSwapV3Pair = IFSwapV3Pair;
    function getDexPair(wallet, dexType, pairAddress) {
        let dexPair;
        let pairContract;
        if (dexType === interfaces_2.IDexType.IFSwapV3) {
            pairContract = new oswap_impossible_swap_contract_1.Contracts.ImpossiblePair(wallet, pairAddress);
            dexPair = new IFSwapV3Pair(pairContract);
        }
        else {
            pairContract = new oswap_openswap_contract_2.Contracts.OSWAP_Pair(wallet, pairAddress);
            dexPair = new NormalDexPair(pairContract);
        }
        return {
            dexPair: dexPair,
            contract: pairContract
        };
    }
    exports.getDexPair = getDexPair;
    function parseSwapEvents(wallet, receipt, pairAddresses) {
        let events = [];
        for (let pairAddress of pairAddresses) {
            let pair = new oswap_openswap_contract_2.Contracts.OSWAP_Pair(wallet, pairAddress);
            let event = pair.parseSwapEvent(receipt)[0];
            events.push(event);
        }
        return events;
    }
    exports.parseSwapEvents = parseSwapEvents;
});
define("@scom/scom-dex-list", ["require", "exports", "@ijstech/eth-contract", "@ijstech/components", "@scom/scom-dex-list/routerSwap.ts", "@scom/scom-dex-list/interfaces.ts", "@scom/scom-dex-list/dexPair.ts", "@ijstech/eth-wallet"], function (require, exports, eth_contract_1, components_1, routerSwap_1, interfaces_3, dexPair_1, eth_wallet_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.executeRouterSwap = exports.getRouterSwapTxData = exports.getDexPairReserves = exports.findDexDetail = exports.findDex = exports.parseSwapEvents = exports.getSwapProxySelectors = exports.IDexType = void 0;
    Object.defineProperty(exports, "getSwapProxySelectors", { enumerable: true, get: function () { return routerSwap_1.getSwapProxySelectors; } });
    Object.defineProperty(exports, "IDexType", { enumerable: true, get: function () { return interfaces_3.IDexType; } });
    Object.defineProperty(exports, "parseSwapEvents", { enumerable: true, get: function () { return dexPair_1.parseSwapEvents; } });
    let moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    function findDex(dexCode) {
        return getDexList().find(d => d.dexCode === dexCode);
    }
    exports.findDex = findDex;
    function findDexDetail(dexCode, chainId) {
        const dexInfo = findDex(dexCode);
        if (!dexInfo)
            return { dexInfo: undefined, dexDetail: undefined };
        const dexDetail = dexInfo.details.find(d => d.chainId === chainId);
        return { dexInfo, dexDetail };
    }
    exports.findDexDetail = findDexDetail;
    async function getDexPairReserves(chainId, dexCode, pairAddress, tokenInAddress, tokenOutAddress) {
        const dexInfo = findDex(dexCode);
        if (!dexInfo)
            return Promise.reject(new Error('Dex not found'));
        const wallet = eth_wallet_2.RpcWallet.getRpcWallet(chainId);
        let dexPairObject = (0, dexPair_1.getDexPair)(wallet, dexInfo.dexType, pairAddress);
        let dexPair = dexPairObject.dexPair;
        let reserves = await dexPair.getReserves();
        let reserveObj;
        if (new eth_contract_1.BigNumber(tokenInAddress.toLowerCase()).lt(tokenOutAddress.toLowerCase())) {
            reserveObj = {
                reserveA: reserves.reserve0,
                reserveB: reserves.reserve1
            };
        }
        else {
            reserveObj = {
                reserveA: reserves.reserve1,
                reserveB: reserves.reserve0
            };
        }
        return reserveObj;
    }
    exports.getDexPairReserves = getDexPairReserves;
    async function getRouterSwapTxData(chainId, dexCode, options) {
        const { dexInfo, dexDetail } = findDexDetail(dexCode, chainId);
        if (!dexInfo || !dexDetail)
            return Promise.reject(new Error('Dex not found'));
        let txData;
        let routerSwap = (0, routerSwap_1.getRouterSwap)(dexInfo.dexType, dexDetail.routerAddress);
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
    exports.getRouterSwapTxData = getRouterSwapTxData;
    async function executeRouterSwap(chainId, dexCode, options) {
        const { dexInfo, dexDetail } = findDexDetail(dexCode, chainId);
        if (!dexInfo || !dexDetail)
            return Promise.reject(new Error('Dex not found'));
        let receipt;
        let routerSwap = (0, routerSwap_1.getRouterSwap)(dexInfo.dexType, dexDetail.routerAddress);
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
    exports.executeRouterSwap = executeRouterSwap;
    function getDexList() {
        return [
            {
                dexCode: 'UniswapV2',
                dexName: 'UniswapV2',
                dexType: interfaces_3.IDexType.Normal,
                details: [
                    {
                        chainId: 1,
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
                dexType: interfaces_3.IDexType.Normal,
                details: [
                    {
                        chainId: 1,
                        routerAddress: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
                        factoryAddress: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
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
                dexType: interfaces_3.IDexType.Normal,
                details: [
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
                        chainId: 43113,
                        routerAddress: '0xc9C6f026E489e0A8895F67906ef1627f1E56860d',
                        factoryAddress: '0x9560fD7C36527001D3Fea2510D405F77cB6AD739',
                        tradeFee: {
                            fee: '200',
                            base: '100000'
                        },
                    }
                ],
                image: fullPath('/img/openswap.png')
            },
            {
                dexCode: 'PancakeSwapV2',
                dexName: 'PancakeSwapV2',
                dexType: interfaces_3.IDexType.Normal,
                details: [
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
                dexCode: 'IFSwapV1',
                dexName: 'IFSwapV1',
                dexType: interfaces_3.IDexType.Normal,
                details: [
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
                dexType: interfaces_3.IDexType.IFSwapV3,
                details: [
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
                dexType: interfaces_3.IDexType.BakerySwap,
                details: [
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
                dexType: interfaces_3.IDexType.Normal,
                details: [
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
                dexType: interfaces_3.IDexType.TraderJoe,
                details: [
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
                dexType: interfaces_3.IDexType.TraderJoe,
                details: [
                    {
                        chainId: 43114,
                        routerAddress: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
                        factoryAddress: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
                        tradeFee: {
                            fee: '3',
                            base: '1000'
                        },
                    },
                ],
                image: fullPath('/img/pangolin.svg')
            }
        ];
    }
    exports.default = getDexList;
});
