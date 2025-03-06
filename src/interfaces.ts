import { BigNumber, TransactionOptions, TransactionReceipt, Event } from '@ijstech/eth-contract';
export interface ITradeFeeInfo {
    fee: string;
    base: string;
}

export enum IDexType {
    Normal = 'Normal',
    BakerySwap = 'BakerySwap',
    TraderJoe = 'TraderJoe',
    IFSwapV3 = 'IFSwapV3'
}

export interface IDexInfo {
    dexCode: string;
    dexName: string;
    dexType: IDexType;
    details : IDexDetail[];
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
    txOptions?: TransactionOptions
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