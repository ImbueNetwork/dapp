import { ApiPromise, WsProvider } from "@polkadot/api";


(async (): Promise<void> => {
    const provider: WsProvider = new WsProvider("ws://localhost:9944");
    const api: ApiPromise = await ApiPromise.create({provider});
    
    console.log(api.genesisHash.toHex());
})();
