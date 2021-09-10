import { inject, injectable } from "../node_modules/inversify";
import { Board, BoardStatus } from "./Board";
import { Awake, Start } from "./ExecutionOrderController";
import { ILiteEvent, LiteEvent } from "./LiteEvent";

@injectable()
export class EmoticonButton implements Start, Awake {
    public get container(): PIXI.Container {
        return this._container;
    }

    public get OnPressed(): ILiteEvent<{}> { 
        return this._onPressed.expose(); 
    }

    private readonly _onPressed = new LiteEvent();

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite: PIXI.Sprite = new PIXI.Sprite();

    private readonly _board: Board;

    public constructor(@inject(Board) board: Board) {
        this._board = board;
    }

    public awake(): void {
        this._board.OnNewBoardStatus.subscribe(() => {
            if(this._board.status == BoardStatus.Dead) {
                this._sprite.texture = PIXI.utils.TextureCache["dead"];
            }

            if(this._board.status == BoardStatus.Win) {
                this._sprite.texture = PIXI.utils.TextureCache["sunClasses"];
            }

            if(this._board.status == BoardStatus.WaitToPlay) {
                this._sprite.texture = PIXI.utils.TextureCache["smile"];
            }

            if(this._board.status == BoardStatus.Playing) {
                this._sprite.texture = PIXI.utils.TextureCache["smile"];
            }

            if(this._board.status == BoardStatus.Empty) {
                this._sprite.texture = PIXI.utils.TextureCache["smile"];
            }
        });
    }

    public start(): void {
        this._sprite.texture = PIXI.utils.TextureCache["smile"];

        this._sprite.buttonMode = true;
        this._sprite.interactive = true;

        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;

        this._sprite.on('pointerdown', () => { 
            this._sprite.texture = PIXI.utils.TextureCache["smilePressed"];
        });

        this._sprite.on('pointerup', () => { 
            this._onPressed.invoke();
        });

        this._container.addChild(this._sprite);
    }

    public setSuprised(isSuprised: boolean): void {
        if(isSuprised) {
            this._sprite.texture = PIXI.utils.TextureCache["suprised"];
        } else {
            this._sprite.texture = PIXI.utils.TextureCache["smile"];
        }
    }

    public load(): void {
        PIXI.loader.add("smile", "assets/smile.gif");
        PIXI.loader.add("dead", "assets/dead.gif");
        PIXI.loader.add("smilePressed", "assets/smilePressed.gif");
        PIXI.loader.add("sunClasses", "assets/sunClasses.gif");
        PIXI.loader.add("suprised", "assets/suprised.gif");
    }
}