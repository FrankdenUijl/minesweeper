import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { Border, Direction } from "./Border";
import { Counter } from "./Counter";
import { injectable, inject } from "inversify";
import { Board, BoardStatus } from "./Board";
import { Awake, Start, Load } from "./ExecutionOrderController";
import { GameTime } from "./GameTime";
import { EmoticonButton } from "./EmoticonButton";

@injectable()
export class TopBar implements Awake, Start, Load {
    public get container(): PIXI.Container {
        return this._container;
    }

    public get OnDragStart(): ILiteEvent<PIXI.interaction.InteractionData> { 
        return this._onDragStart.expose(); 
    }

    public get OnDragEnd(): ILiteEvent<PIXI.Point, PIXI.interaction.InteractionData> { 
        return this._onDragEnd.expose(); 
    }

    public get OnDragMove(): ILiteEvent<PIXI.Point, PIXI.interaction.InteractionData> { 
        return this._onDragMove.expose(); 
    }

    private _isDragging: boolean;
    private _mouseData: PIXI.interaction.InteractionData;
    private _startPoint: PIXI.Point;

    private readonly _topBorder: Border = new Border();
    private readonly _bottomBorder: Border = new Border();
    private readonly _rightBorder: Border = new Border(); 
    private readonly _leftBorder: Border = new Border();

    private readonly _onDragStart = new LiteEvent<PIXI.interaction.InteractionData>();
    private readonly _onDragEnd = new LiteEvent<PIXI.Point, PIXI.interaction.InteractionData>();
    private readonly _onDragMove = new LiteEvent<PIXI.Point, PIXI.interaction.InteractionData>();

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _background: PIXI.Graphics = new PIXI.Graphics();

    private readonly _counterFlagsLeft = new Counter();
    private readonly _counter = new Counter();

    private readonly _board: Board;
    private readonly _gameTime: GameTime;
    private readonly _emoticonButton: EmoticonButton;

    public constructor(@inject(Board) board: Board,
        @inject(GameTime) gameTime: GameTime,
        @inject(EmoticonButton) emoticonButton: EmoticonButton) {
        this._board = board;
        this._gameTime = gameTime;
        this._emoticonButton = emoticonButton;
    }

    public awake(): void {
        this._gameTime.OnTick.subscribe(() => {
            this._counter.setNumber(this._gameTime.time);
        });

        this._board.OnCellFlagged.subscribe((cell) => { 
            this._counterFlagsLeft.setNumber(this._board.totalFlagsLeft);
        });

        this._board.OnNewBoardStatus.subscribe((status) => { 
            if(this._board.status == BoardStatus.Win) {
                this._counterFlagsLeft.setNumber(0);
            }
            if(this._board.status == BoardStatus.Empty) {
                this._counterFlagsLeft.setNumber(0);
            }

            if(this._board.status == BoardStatus.WaitToPlay) {
                this._counterFlagsLeft.setNumber(this._board.totalFlagsLeft);
            }
        });
        
        this.setPointerEvents();
    }

    private setPointerEvents(): void {
        this._container.on('pointerdown', (event: PIXI.interaction.InteractionEvent) => {
            this._mouseData = event.data;

            this._startPoint =  event.data.getLocalPosition(this._container);

            this._isDragging = true;
            this._onDragStart.invoke(event.data);
        });

        this._container.on('pointerup', () => {
            let mouseDate = this._mouseData;
            let startPoint = this._startPoint;

            this._mouseData = null;
            this._isDragging = false;
            this._startPoint = null;

            this._onDragEnd.invoke(startPoint, mouseDate);
        });
        
        this._container.on('pointerupoutside', () => {
            let mouseDate = this._mouseData;
            let startPoint = this._startPoint;

            this._mouseData = null;
            this._isDragging = false;
            this._startPoint = null;

            this._onDragEnd.invoke(startPoint, mouseDate);
        });

        this._container.on('pointermove', () => {
            if(this._isDragging) {
                this._onDragMove.invoke(this._startPoint, this._mouseData);
            }
        });
    }

    public start(): void {
        this._container.interactive = true;
        this._container.cursor = 'move';

        this._container.addChild(this._background);
        this._container.addChild(this._counterFlagsLeft.container);
        this._container.addChild(this._counter.container);
        this._container.addChild(this._emoticonButton.container);

        this._emoticonButton.container.y = -35;

        this._counterFlagsLeft.container.y = -47;
        this._counter.container.y = -47;

        this.setBorders();

        this._counterFlagsLeft.setNumber(this._board.totalFlagsLeft);
        this._counter.setNumber(0);
    }

    private setBorders(): void {
        this._topBorder.init(PIXI.utils.TextureCache["bottom"],
            PIXI.utils.TextureCache["leftTop"],
            PIXI.utils.TextureCache["rightTop"],
            10, 
            10, 
            Direction.Horizontal, 
            false);
            
        this._topBorder.container.y = -70;

        this._bottomBorder.init(PIXI.utils.TextureCache["bottom"],
            PIXI.utils.TextureCache["middleLeft"],
            PIXI.utils.TextureCache["middleRight"],
            10, 
            10, 
            Direction.Horizontal, 
            false);
        
        this._bottomBorder.container.y = -10;

        this._rightBorder.init(PIXI.utils.TextureCache["rightSide"],
            PIXI.utils.TextureCache["rightTop"],
            PIXI.utils.TextureCache["middleRight"],
            10, 
            50, 
            Direction.Vertical, 
            false);

        this._rightBorder.container.x = 10;
        this._rightBorder.container.y = -60

        this._leftBorder.init(PIXI.utils.TextureCache["rightSide"],
            PIXI.utils.TextureCache["leftTop"],
            PIXI.utils.TextureCache["middleLeft"],
            10, 
            50, 
            Direction.Vertical, 
            false);

        this._leftBorder.container.x = -10
        this._leftBorder.container.y = -60

        this._container.addChild(this._topBorder.container);
        this._container.addChild(this._bottomBorder.container);
        this._container.addChild(this._rightBorder.container);
        this._container.addChild(this._leftBorder.container);
    }

    public setWidth(width: number): void {
        this._topBorder.width = width;
        this._bottomBorder.width = width;
        this._rightBorder.container.x = width;

        this._counterFlagsLeft.container.x = 10;
        this._counter.container.x = width - 48;
        this._emoticonButton.container.x = width * 0.5;

        this._background.clear();
        this._background.beginFill(0xC0C0C0, 1);
        this._background.lineStyle(0);
        this._background.drawRect(0, -60, width, 50);
        this._background.endFill();
    }

    public load(): void {
        for (let i = 0; i <= 9; i++) {
            PIXI.loader.add("0" + i, "assets/0" + i + ".gif");
        }
    }
}