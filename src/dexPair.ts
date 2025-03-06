import { Contracts as OswapContracts } from '@scom/oswap-openswap-contract';
import { Contracts as IFSwapContracts } from '@scom/oswap-impossible-swap-contract';
import { BigNumber, IRpcWallet, TransactionReceipt } from '@ijstech/eth-wallet';
import { IDexPairReserves, IDexType, ISwapEvent } from './interfaces';
import { TransactionOptions } from '@ijstech/eth-contract';

export abstract class DexPair {
    protected pair: any;
    constructor(pair: any) {
        this.pair = pair;
    }
    abstract getReserves: (options?: TransactionOptions) => Promise<IDexPairReserves>;
}

export class NormalDexPair extends DexPair {
    protected pair: OswapContracts.OSWAP_Pair;
    constructor(pair: OswapContracts.OSWAP_Pair) {
        super(pair);
    }
    getReserves = this.pair.getReserves;
}

export class IFSwapV3Pair extends DexPair {
    protected pair: IFSwapContracts.ImpossiblePair;
    constructor(pair: IFSwapContracts.ImpossiblePair) {
        super(pair);
    }
    getReserves = this.pair.getReserves;
}

export interface IGetDexPairOutput {
    dexPair: DexPair;
    contract: any;
}

export function getDexPair(wallet: IRpcWallet, dexType: IDexType, pairAddress: string): IGetDexPairOutput {
    let dexPair: DexPair;
    let pairContract: any;
    if (dexType === IDexType.IFSwapV3) {
        pairContract = new IFSwapContracts.ImpossiblePair(wallet, pairAddress);
        dexPair = new IFSwapV3Pair(pairContract);
    }
    else {
        pairContract = new OswapContracts.OSWAP_Pair(wallet, pairAddress);
        dexPair = new NormalDexPair(pairContract);
    }
    return {
        dexPair: dexPair,
        contract: pairContract
    };
}

export function parseSwapEvents(wallet: IRpcWallet, receipt: TransactionReceipt, pairAddresses: string[]) {
    let events: ISwapEvent[] = [];
    for (let pairAddress of pairAddresses) {
        let pair = new OswapContracts.OSWAP_Pair(wallet, pairAddress);
        let event = pair.parseSwapEvent(receipt)[0];
        events.push(event);
    }
    return events;
}