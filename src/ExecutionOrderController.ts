import { multiInject, injectable } from "inversify";

export interface Load {
    load(): void;
}

export interface Awake {
    awake(): void;
}

export interface Start {
    start(): void;
}

export interface Update {
    update(deltaTime: number): void;
}

export interface OnResize {
    onResize(): void;
}

@injectable()
export class ExecutionOrderController {

    private _loaders: Load[];
    private _awakers: Awake[];
    private _starters: Start[];
    private _updaters: Update[];
    private _onResizers: OnResize[];

    public constructor(@multiInject("Load") loaders: Load[],
        @multiInject("Awake") awakers: Awake[],
        @multiInject("Start") starters: Start[],
        @multiInject("Update") updaters: Update[],
        @multiInject("OnResize") onResizers: OnResize[]) {
        this._loaders = loaders;
        this._awakers = awakers;
        this._starters = starters;
        this._updaters = updaters;
        this._onResizers = onResizers;
    }

    public remove(item: Update | OnResize): void {
        this._updaters = this._updaters.filter(h => h !== item);
        this._onResizers = this._onResizers.filter(h => h !== item);
    }

    public add(item: Awake | Start | Update | OnResize): void {
        if((item as Awake).awake !== undefined) {
            (item as Awake).awake();
        }
        if((item as Start).start !== undefined) {
            (item as Start).start();
        }
        if((item as Update).update !== undefined) {
            this._updaters.push(<Update>item);
        }
        if((item as OnResize).onResize !== undefined) {
            this._onResizers.push(<OnResize>item);
        }
    }

    public load(): void {
        for(let load of this._loaders){
            load.load();
        }

        this._loaders = null;
    }

    public awake(): void {
        for(let awake of this._awakers){
            awake.awake();
        }

        this._awakers = null;
    }

    public start(): void {
        for(let start of this._starters){
            start.start();
        }

        this._starters = null;
    }

    public update(deltaTime: number): void {
        for(let update of this._updaters){
            update.update(deltaTime);
        }
    }

    public onResize(): void {
        for(let onResize of this._onResizers){
            onResize.onResize();
        }
    }
}