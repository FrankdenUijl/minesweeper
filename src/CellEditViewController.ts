import { Cell } from "./Cell";
import { EmoticonButton } from "./EmoticonButton";
import { inject, injectable } from "../node_modules/inversify";

@injectable()
export class CellEditViewController {
    public get container(): PIXI.Container {
        return this._container;
    }

    private _cell: Cell;

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite: PIXI.Sprite  = new PIXI.Sprite();

    private readonly _emoticonButton: EmoticonButton;

    public constructor(@inject(EmoticonButton) emoticonButton: EmoticonButton)
    {
        this._emoticonButton = emoticonButton;
    }

    public init(cell: Cell): void {
        this._cell = cell;
    }

    public awake(): void {
        this.setEvents();
    }

    private setEvents(): void {
        this._cell.OnMineChange.subscribe(() => {
            this._sprite.texture = this._cell.isMine ? PIXI.utils.TextureCache["cellBomb"] : PIXI.utils.TextureCache["cell00"];
        });

        this._sprite.on('pointerdown', (e) => { 
            this._sprite.texture = this._cell.isMine ? PIXI.utils.TextureCache["cellBombCross"] : PIXI.utils.TextureCache["cellExplosion"];
            this._emoticonButton.setSuprised(true);
        });

        this._sprite.on('pointerupoutside', () => { 
            this._emoticonButton.setSuprised(false);
        });

        this._sprite.on('pointerout', () => { 
            this._sprite.texture = this._cell.isMine ? PIXI.utils.TextureCache["cellBomb"] : PIXI.utils.TextureCache["cell00"];
        });

        this._sprite.on('pointerup', () => { 
            this._emoticonButton.setSuprised(false);

            this._cell.SetMine(!this._cell.isMine);
        });

        this._cell.OnRemove.subscribe(() => { 
            this.onRemove(); 
        });
    }

    public start(): void {
        this.initSprite();
    }

    private initSprite()
    {
        this._sprite.texture = PIXI.utils.TextureCache["cell00"];

        this._sprite.anchor.set(0);
        this._container.addChild(this._sprite);

        this._sprite.x = this._cell.position.x * this._sprite.width;
        this._sprite.y = this._cell.position.y * this._sprite.height;

        this._sprite.interactive = true;
        this._sprite.buttonMode = true;
    }

    private onRemove(): void {
        this._sprite.interactive = false;
        this._sprite.buttonMode = false;

        this._container.removeChild(this._sprite);
    }
}