//stole from: https://stackoverflow.com/questions/12881212/does-typescript-support-events-on-classes

export interface ILiteEvent<T1, T2 = {}> {
    subscribe(handler: { (data1?: T1, data2?: T2): void }) : void;
    unsubscribe(handler: { (data1?: T1, data2?: T2): void }) : void;
}

export class LiteEvent<T1, T2 = {}> implements ILiteEvent<T1, T2> {
    private handlers: { (data1?: T1, data2?: T2): void }[] = [];

    public subscribe(handler: { (data1?: T1, data2?: T2): void }) : void {
        this.handlers.push(handler);
    }

    public unsubscribe(handler: { (data1?: T1, data2?: T2): void }) : void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public invoke(data1?: T1, data2?: T2): void {
        this.handlers.forEach(h => h(data1, data2));
    }

    public expose() : ILiteEvent<T1, T2> {
        return this;
    }
}