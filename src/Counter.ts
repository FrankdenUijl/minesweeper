export class Counter {
    public get container(): PIXI.Container {
        return this._container;
    }

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite0: PIXI.Sprite  = new PIXI.Sprite();
    private readonly _sprite1: PIXI.Sprite  = new PIXI.Sprite();
    private readonly _sprite2: PIXI.Sprite  = new PIXI.Sprite();

    public constructor() {
        this._container.addChild(this._sprite0);
        this._container.addChild(this._sprite1);
        this._container.addChild(this._sprite2);
    }

    public setNumber(number: number): void {
        
        this._sprite1.x = PIXI.utils.TextureCache["00"].width;
        this._sprite2.x = PIXI.utils.TextureCache["00"].width * 2;

        var numberString = (number < 10 ? 
            '00' : number < 100 ? 
            '0' : '' ) + number;

        this._sprite0.texture = PIXI.utils.TextureCache["0" + numberString[0]];
        this._sprite1.texture = PIXI.utils.TextureCache["0" + numberString[1]];
        this._sprite2.texture = PIXI.utils.TextureCache["0" + numberString[2]]; 
    }
}