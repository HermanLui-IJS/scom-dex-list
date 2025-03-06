/// <amd-module name="@scom/scom-dex-list/interfaces.ts" />
declare module "@scom/scom-dex-list/interfaces.ts" {
    import { BigNumber, TransactionOptions, TransactionReceipt, Event } from '@ijstech/eth-contract';
    export interface ITradeFeeInfo {
        fee: string;
        base: string;
    }
    export enum IDexType {
        Normal = "Normal",
        BakerySwap = "BakerySwap",
        TraderJoe = "TraderJoe",
        IFSwapV3 = "IFSwapV3"
    }
    export interface IDexInfo {
        dexCode: string;
        dexName: string;
        dexType: IDexType;
        details: IDexDetail[];
        image: string;
    }
    export interface IDexDetail {
        chainId: number;
        routerAddress: string;
        factoryAddress: string;
        tradeFee: ITradeFeeInfo;
    }
    export interface IRouterSwapOutput {
        (params: any, options?: TransactionOptions): Promise<TransactionReceipt>;
        txData: (params: any, options?: TransactionOptions) => Promise<string>;
    }
    export interface IExecuteSwapOptions {
        feeOnTransfer: boolean;
        exactType: 'exactIn' | 'exactOut';
        tokenInType: 'ETH' | 'ERC20';
        tokenOutType: 'ETH' | 'ERC20';
        params: any;
        txOptions?: TransactionOptions;
    }
    export interface IDexPairReserves {
        reserve0: BigNumber;
        reserve1: BigNumber;
        blockTimestampLast?: BigNumber;
    }
    export interface IGetDexPairReservesOutput {
        reserveA: BigNumber;
        reserveB: BigNumber;
    }
    export interface ISwapEvent {
        sender: string;
        amount0In: BigNumber;
        amount1In: BigNumber;
        amount0Out: BigNumber;
        amount1Out: BigNumber;
        to: string;
        _event: Event;
    }
}
/// <amd-module name="@scom/scom-dex-list/routerSwap.ts" />
declare module "@scom/scom-dex-list/routerSwap.ts" {
    import { Contracts as BakeryContracts } from '@scom/oswap-bakery-swap-contract';
    import { Contracts as TraderJoeContracts } from '@scom/oswap-trader-joe-contract';
    import { IDexType, IRouterSwapOutput } from "@scom/scom-dex-list/interfaces.ts";
    export abstract class RouterSwap {
        protected router: any;
        constructor(router: any);
        abstract PermittedProxyFunctions: string[];
        abstract swapExactETHForTokensSupportingFeeOnTransferTokens: IRouterSwapOutput;
        abstract swapExactETHForTokens: IRouterSwapOutput;
        abstract swapExactTokensForETHSupportingFeeOnTransferTokens: IRouterSwapOutput;
        abstract swapExactTokensForETH: IRouterSwapOutput;
        abstract swapExactTokensForTokensSupportingFeeOnTransferTokens: IRouterSwapOutput;
        abstract swapExactTokensForTokens: IRouterSwapOutput;
        abstract swapETHForExactTokens: IRouterSwapOutput;
        abstract swapTokensForExactETH: IRouterSwapOutput;
        abstract swapTokensForExactTokens: IRouterSwapOutput;
    }
    export class NormalRouterSwap extends RouterSwap {
        protected router: any;
        constructor(router: any);
        PermittedProxyFunctions: string[];
        swapExactETHForTokensSupportingFeeOnTransferTokens: any;
        swapExactETHForTokens: any;
        swapExactTokensForETHSupportingFeeOnTransferTokens: any;
        swapExactTokensForETH: any;
        swapExactTokensForTokensSupportingFeeOnTransferTokens: any;
        swapExactTokensForTokens: any;
        swapETHForExactTokens: any;
        swapTokensForExactETH: any;
        swapTokensForExactTokens: any;
    }
    export class BakerySwapRouterSwap extends NormalRouterSwap {
        protected router: BakeryContracts.BakerySwapRouter;
        constructor(router: BakeryContracts.BakerySwapRouter);
        PermittedProxyFunctions: (keyof BakeryContracts.BakerySwapRouter)[];
        swapExactETHForTokensSupportingFeeOnTransferTokens: any;
        swapExactETHForTokens: any;
        swapExactTokensForETHSupportingFeeOnTransferTokens: any;
        swapExactTokensForETH: any;
        swapETHForExactTokens: any;
        swapTokensForExactETH: any;
    }
    export class TraderJoeRouterSwap extends NormalRouterSwap {
        protected router: TraderJoeContracts.JoeRouter02;
        constructor(router: TraderJoeContracts.JoeRouter02);
        PermittedProxyFunctions: (keyof TraderJoeContracts.JoeRouter02)[];
        swapExactETHForTokensSupportingFeeOnTransferTokens: any;
        swapExactETHForTokens: any;
        swapExactTokensForETHSupportingFeeOnTransferTokens: any;
        swapExactTokensForETH: any;
        swapETHForExactTokens: any;
        swapTokensForExactETH: any;
    }
    export function getRouterSwap(dexType: IDexType, routerAddress: string): RouterSwap;
    export function getSwapProxySelectors(dexType: IDexType, chainId: number, routerAddress: string): Promise<string[]>;
}
/// <amd-module name="@scom/scom-dex-list/dexPair.ts" />
declare module "@scom/scom-dex-list/dexPair.ts" {
    import { Contracts as OswapContracts } from '@scom/oswap-openswap-contract';
    import { Contracts as IFSwapContracts } from '@scom/oswap-impossible-swap-contract';
    import { BigNumber, IRpcWallet, TransactionReceipt } from '@ijstech/eth-wallet';
    import { IDexPairReserves, IDexType, ISwapEvent } from "@scom/scom-dex-list/interfaces.ts";
    import { TransactionOptions } from '@ijstech/eth-contract';
    export abstract class DexPair {
        protected pair: any;
        constructor(pair: any);
        abstract getReserves: (options?: TransactionOptions) => Promise<IDexPairReserves>;
    }
    export class NormalDexPair extends DexPair {
        protected pair: OswapContracts.OSWAP_Pair;
        constructor(pair: OswapContracts.OSWAP_Pair);
        getReserves: (options?: TransactionOptions) => Promise<{
            reserve0: BigNumber;
            reserve1: BigNumber;
            blockTimestampLast: BigNumber;
        }>;
    }
    export class IFSwapV3Pair extends DexPair {
        protected pair: IFSwapContracts.ImpossiblePair;
        constructor(pair: IFSwapContracts.ImpossiblePair);
        getReserves: (options?: TransactionOptions) => Promise<{
            reserve0: BigNumber;
            reserve1: BigNumber;
        }>;
    }
    export interface IGetDexPairOutput {
        dexPair: DexPair;
        contract: any;
    }
    export function getDexPair(wallet: IRpcWallet, dexType: IDexType, pairAddress: string): IGetDexPairOutput;
    export function parseSwapEvents(wallet: IRpcWallet, receipt: TransactionReceipt, pairAddresses: string[]): ISwapEvent[];
}
/// <amd-module name="@scom/scom-dex-list" />
declare module "@scom/scom-dex-list" {
    import { TransactionReceipt } from '@ijstech/eth-contract';
    import { getSwapProxySelectors } from "@scom/scom-dex-list/routerSwap.ts";
    import { IDexInfo, IDexType, IDexDetail, IExecuteSwapOptions, IGetDexPairReservesOutput, ISwapEvent } from "@scom/scom-dex-list/interfaces.ts";
    import { parseSwapEvents } from "@scom/scom-dex-list/dexPair.ts";
    export { IDexInfo, IDexType, IExecuteSwapOptions, IGetDexPairReservesOutput, getSwapProxySelectors, IDexDetail, ISwapEvent, parseSwapEvents };
    export function findDex(dexCode: string): IDexInfo;
    export function findDexDetail(dexCode: string, chainId: number): {
        dexInfo: IDexInfo;
        dexDetail: IDexDetail;
    };
    export function getDexPairReserves(chainId: number, dexCode: string, pairAddress: string, tokenInAddress: string, tokenOutAddress: string): Promise<IGetDexPairReservesOutput>;
    export function getRouterSwapTxData(chainId: number, dexCode: string, options: IExecuteSwapOptions): Promise<string>;
    export function executeRouterSwap(chainId: number, dexCode: string, options: IExecuteSwapOptions): Promise<TransactionReceipt>;
    export default function getDexList(): IDexInfo[];
}
