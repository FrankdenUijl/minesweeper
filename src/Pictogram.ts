import { Start, Awake } from "./ExecutionOrderController";
import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { injectable } from "../node_modules/inversify";

@injectable()
export class Pictogram implements Awake, Start {
    public get container(): PIXI.Container {
        return this._container;
    }

    public get OnPressed(): ILiteEvent<{}> { 
        return this._onPressed.expose(); 
    } 

    public get isInteractive(): boolean {
        return this._container.interactive;
    }

    public set isInteractive(value: boolean) {
        this._container.interactive = value;
        this._container.buttonMode = value;

        this._sprite.alpha = value ? 1 : 0.5;
    }

    private readonly _onPressed = new LiteEvent<{}>();

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite: PIXI.Sprite = new PIXI.Sprite();

    private _texture: PIXI.Texture;
    private _name: PIXI.Text = new PIXI.Text('', {fontFamily : 'Arial', fontSize: 12, fill : 0xFFFFFF});

    public init(texture: PIXI.Texture,
        name: string): void {
        this._texture = texture;
        this._name.text = name;
    }

    public awake(): void {
        this._container.on('pointerup', () => { 
            this._onPressed.invoke();
        });
    }

    public start(): void {
        this._sprite.texture = this._texture;
        this._sprite.anchor.set(0.5, 0.5);
        this._name.anchor.set(0.5, 0);

        this._name.y = (this._sprite.height * 0.5) + 5;

        this.isInteractive = true;

        this._container.addChild(this._sprite);
        this._container.addChild(this._name);
    }
}