import { Contracts as OswapContracts } from '@scom/oswap-openswap-contract';
import { Contracts as BakeryContracts } from '@scom/oswap-bakery-swap-contract';
import { Contracts as TraderJoeContracts } from '@scom/oswap-trader-joe-contract';
import { IRpcWallet, RpcWallet, Wallet } from '@ijstech/eth-wallet';
import { IDexType, IRouterSwapOutput } from './interfaces';

export abstract class RouterSwap {
    protected router: any;
    constructor(router: any) {
        this.router = router;
    }
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
    constructor(router: any) {
        super(router);
    }
    PermittedProxyFunctions = [
        "swapExactTokensForTokens", 
        "swapTokensForExactTokens", 
        "swapExactETHForTokens", 
        "swapTokensForExactETH", 
        "swapExactTokensForETH", 
        "swapETHForExactTokens"
    ];
    swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactETHForTokensSupportingFeeOnTransferTokens;
    swapExactETHForTokens = this.router.swapExactETHForTokens;
    swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForETHSupportingFeeOnTransferTokens;
    swapExactTokensForETH = this.router.swapExactTokensForETH;
    swapExactTokensForTokensSupportingFeeOnTransferTokens = this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens;
    swapExactTokensForTokens = this.router.swapExactTokensForTokens;
    swapETHForExactTokens = this.router.swapETHForExactTokens;
    swapTokensForExactETH = this.router.swapTokensForExactETH;
    swapTokensForExactTokens = this.router.swapTokensForExactTokens;
}

export class BakerySwapRouterSwap extends NormalRouterSwap {
    protected router: BakeryContracts.BakerySwapRouter;
    constructor(router: BakeryContracts.BakerySwapRouter) {
        super(router);
    }
    PermittedProxyFunctions: (keyof BakeryContracts.BakerySwapRouter)[] = [
        "swapExactTokensForTokens", 
        "swapTokensForExactTokens", 
        "swapExactBNBForTokens", 
        "swapTokensForExactBNB", 
        "swapExactTokensForBNB", 
        "swapBNBForExactTokens"
    ];
    swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactBNBForTokensSupportingFeeOnTransferTokens as any;
    swapExactETHForTokens = this.router.swapExactBNBForTokens as any;
    swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForBNBSupportingFeeOnTransferTokens as any;
    swapExactTokensForETH = this.router.swapExactTokensForBNB as any;
    swapETHForExactTokens = this.router.swapBNBForExactTokens as any;
    swapTokensForExactETH = this.router.swapTokensForExactBNB as any;
}

export class TraderJoeRouterSwap extends NormalRouterSwap {
    protected router: TraderJoeContracts.JoeRouter02;
    constructor(router: TraderJoeContracts.JoeRouter02) {
        super(router);
    }
    PermittedProxyFunctions: (keyof TraderJoeContracts.JoeRouter02)[] = [
        "swapExactTokensForTokens", 
        "swapTokensForExactTokens", 
        "swapExactAVAXForTokens", 
        "swapTokensForExactAVAX", 
        "swapExactTokensForAVAX", 
        "swapAVAXForExactTokens"
    ];
    swapExactETHForTokensSupportingFeeOnTransferTokens = this.router.swapExactAVAXForTokensSupportingFeeOnTransferTokens as any;
    swapExactETHForTokens = this.router.swapExactAVAXForTokens as any;
    swapExactTokensForETHSupportingFeeOnTransferTokens = this.router.swapExactTokensForAVAXSupportingFeeOnTransferTokens as any;
    swapExactTokensForETH = this.router.swapExactTokensForAVAX as any;
    swapETHForExactTokens = this.router.swapAVAXForExactTokens as any;
    swapTokensForExactETH = this.router.swapTokensForExactAVAX as any;
}

export function getRouterSwap(dexType:IDexType, routerAddress:string): RouterSwap {
    const wallet = Wallet.getClientInstance();
    let routerSwap: RouterSwap;
    if (dexType === IDexType.BakerySwap) {
        const router = new BakeryContracts.BakerySwapRouter(wallet, routerAddress);
        routerSwap = new BakerySwapRouterSwap(router);
    }
    else if (dexType === IDexType.TraderJoe) {
        const router = new TraderJoeContracts.JoeRouter02(wallet, routerAddress);
        routerSwap = new TraderJoeRouterSwap(router);
    }
    else {
        const router = new OswapContracts.OSWAP_Router(wallet, routerAddress);
        routerSwap = new NormalRouterSwap(router);     
    }
    return routerSwap;
}

export async function getSwapProxySelectors(dexType: IDexType, chainId: number, routerAddress:string): Promise<string[]> {
    let routerSwap: RouterSwap;
    let router: any;
    let wallet = RpcWallet.getRpcWallet(chainId);
    if (dexType === IDexType.BakerySwap) {
        router = new BakeryContracts.BakerySwapRouter(wallet, routerAddress);
        routerSwap = new BakerySwapRouterSwap(router);
    }
    else if (dexType === IDexType.TraderJoe) {
        router = new TraderJoeContracts.JoeRouter02(wallet, routerAddress);
        routerSwap = new TraderJoeRouterSwap(router);
    }
    else {
        router = new OswapContracts.OSWAP_Router(wallet, routerAddress);
        routerSwap = new NormalRouterSwap(router);     
    }
    let selectors = routerSwap.PermittedProxyFunctions
    .map(e=>e + "(" + router._abi.filter(f=>f.name==e)[0].inputs.map(f=>f.type).join(',') + ")")
    .map(e=>wallet.soliditySha3(e).substring(0,10))
    .map(e=>router.address.toLowerCase() + e.replace("0x", ""));
    return selectors;
}