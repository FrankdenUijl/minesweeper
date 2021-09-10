import { Board, BoardStatus}  from "./Board";
import { injectable, interfaces, inject } from "inversify";
import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { Cell } from "./Cell";
import { CellViewController } from "./CellViewController";
import { Load, Awake, Start } from "./ExecutionOrderController";
import { TopBar } from "./TopBar";
import { Border, Direction } from "./Border";
import { CellEditViewController } from "./CellEditViewController";
import { Stats } from "fs";

@injectable()
export class BoardViewController implements Load, Awake, Start {

    public get container(): PIXI.Container {
        return this._container;
    }

    public get OnStartResize(): ILiteEvent<{}> { 
        return this._onStartResize.expose(); 
    }

    public get OnEndResize(): ILiteEvent<number, number> { 
        return this._onEndResize.expose(); 
    }

    public get OnShake(): ILiteEvent<{}> { 
        return this._onShake.expose(); 
    }

    public get width(): number {
        return this._bottomBorder.width;
    }

    public get height(): number {
        return this._leftBorder.height;
    }

    private _background: PIXI.extras.TilingSprite;

    private readonly _bottomBorder: Border = new Border();
    private readonly _leftBorder: Border = new Border();
    private readonly _rightBorder: Border = new Border();
    
    private readonly _onStartResize = new LiteEvent();
    private readonly _onEndResize = new LiteEvent<number, number>();
    private readonly _onShake = new LiteEvent();

    private readonly _container: PIXI.Container = new PIXI.Container();

    private readonly _board: Board;
    private readonly _cellViewFactory: interfaces.Factory<CellViewController>;
    private readonly _cellEditViewFactory: interfaces.Factory<CellEditViewController>; 
    private readonly _topBar: TopBar;

    public constructor(@inject(Board) board: Board,
        @inject("Factory<CellViewController>") cellViewFactory: (cell: Cell) => CellViewController,
        @inject("Factory<CellEditViewController>") cellEditViewFactory: (cell: Cell) => CellEditViewController,
        @inject(TopBar) topBar: TopBar) {
        this._board = board;
        this._cellViewFactory = cellViewFactory;
        this._cellEditViewFactory = cellEditViewFactory;
        this._topBar = topBar;
    }

    public awake(): void {
        this.setBoardEvents();
        this.setTopBarEvents();
        this.setBorderEvents();
    }

    private setBoardEvents(): void {

        this._board.OnNewCell.subscribe((cell) => { 
            this.onNewCell(cell) 
        });

        this._board.OnNewBoardStatus.subscribe((status) => { 
            if(this._board.status == BoardStatus.WaitToPlay)
            {
                this.resizeBoard(this.cellSize() * this._board.width, this.cellSize() * this._board.height);
            }
        });
    }

    private setTopBarEvents(): void {

        this._topBar.OnDragMove.subscribe((startPoint, data) => { 
            this._container.alpha = 0.5;
            this._container.removeChild(this._background);
        });

        this._topBar.OnDragMove.subscribe((startPoint, data) => { 
            var newPosition = data.getLocalPosition(this._container.parent);
            this._container.x = newPosition.x - startPoint.x;
            this._container.y = newPosition.y - startPoint.y;
        });

        this._topBar.OnDragEnd.subscribe((startPoint, data) => { 
            this._container.alpha = 1;
            this._container.addChildAt(this._background, 0);
        });
    }

    private setBorderEvents(): void {

        this._bottomBorder.OnDragStart.subscribe((startPoint, data) => { 
            this._onStartResize.invoke();
        });

        this._rightBorder.OnDragStart.subscribe((startPoint, data) => { 
            this._onStartResize.invoke();
        });

        this._leftBorder.OnDragStart.subscribe((startPoint, data) => { 
            this._onStartResize.invoke();
        });

        this._bottomBorder.OnDragMove.subscribe((startPoint, data) => { 
            var newPosition = data.getLocalPosition(this._container);
            this.resizeBoard(this.width, newPosition.y - 5);
        });

        this._rightBorder.OnDragMove.subscribe((startPoint, data) => { 
            var newPosition = data.getLocalPosition(this._container);
            this.resizeBoard(newPosition.x - 5, this.height);
        });

        this._leftBorder.OnDragMove.subscribe((startPoint, data) => { 
            var newPosition = data.getLocalPosition(this._container);
            this.resizeBoard(this.width - newPosition.x, this.height);

            var newPosition = data.getLocalPosition(this._container.parent);
            this._container.x = newPosition.x;
        });

        this._bottomBorder.OnDragEnd.subscribe((start, data) => { 
            var width = Math.floor(this.width / this.cellSize());
            var height = Math.floor(this.height / this.cellSize());
            
            this._onEndResize.invoke(width, height);
        });

        this._rightBorder.OnDragEnd.subscribe((start, data) => { 
            var width = Math.floor(this.width / this.cellSize());
            var height = Math.floor(this.height / this.cellSize());
            
            this._onEndResize.invoke(width, height);
        });

        this._leftBorder.OnDragEnd.subscribe((start, data) => { 
            var width = Math.floor(this.width / this.cellSize());
            var height = Math.floor(this.height / this.cellSize());
            
            this._onEndResize.invoke(width, height);
        });
    }

    public start(): void {        
        this._background = new PIXI.extras.TilingSprite(PIXI.utils.TextureCache["cell"],
            this.cellSize() * 10,
            this.cellSize() * 10)

        this.setBorders();
        this.setContainer();
    }

    private setContainer(): void {
        this._container.x = 10;
        this._container.y = 70;

        this._container.addChild(this._topBar.container);
        this._container.addChild(this._background);
    }

    private setBorders(): void {
        this._bottomBorder.init(PIXI.utils.TextureCache["bottom"],
            PIXI.utils.TextureCache["leftBottom"],
            PIXI.utils.TextureCache["rightBottom"],
            this.cellSize() * 10, 
            10, 
            Direction.Horizontal, 
            true);

        this._bottomBorder.container.y = 640;

        this._leftBorder.init(PIXI.utils.TextureCache["rightSide"],
            PIXI.utils.TextureCache["middleLeft"],
            PIXI.utils.TextureCache["leftBottom"],
            10, 
            this.cellSize() * 10, 
            Direction.Vertical, 
            true);

        this._leftBorder.container.x = -10;
        this._leftBorder.container.y = 0;

        this._rightBorder.init(PIXI.utils.TextureCache["rightSide"],
            PIXI.utils.TextureCache["middleRight"],
            PIXI.utils.TextureCache["rightBottom"],
            10, 
            this.cellSize() * 10, 
            Direction.Vertical, 
            true);

        this._rightBorder.container.x = this.cellSize() * 10;
        this._rightBorder.container.y = 0;

        this.container.addChild(this._bottomBorder.container);
        this.container.addChild(this._leftBorder.container);
        this.container.addChild(this._rightBorder.container);
    }

    private resizeBoard(width: number, height: number): void {

        if(width < 140 || height < this.cellSize())
        {
            return;
        }

        this._topBar.setWidth(width);

        this._bottomBorder.width = width;
        this._bottomBorder.container.y = height;

        this._leftBorder.height = height;

        this._rightBorder.height = height;
        this._rightBorder.container.x = width;

        this._background.width = width;
        this._background.height = height;
    }

    private onNewCell(cell: Cell): void {
        this.createNewCellView(cell);
    }

    private createNewCellView(cell: Cell): any {
        let cellView = this._board.status == BoardStatus.Editor ? <CellEditViewController>this._cellEditViewFactory(cell) : <CellViewController>this._cellViewFactory(cell);
        
        this._container.addChild(cellView.container);

        cell.OnRemove.subscribe(() => {
            this._container.removeChild(cellView.container);

            cellView = null;
        });
    
        return cellView;
    }

    private cellSize(): number {
        return PIXI.utils.TextureCache["cell"].width;
    }

    public load(): void {
        PIXI.loader.add("bottom", "assets/bottom.gif");
        PIXI.loader.add("leftBottom", "assets/leftBottom.gif");
        PIXI.loader.add("leftTop", "assets/leftTop.gif");
        PIXI.loader.add("middleLeft", "assets/middleLeft.gif");
        PIXI.loader.add("middleRight", "assets/middleRight.gif");
        PIXI.loader.add("rightBottom", "assets/rightBottom.gif");
        PIXI.loader.add("rightSide", "assets/rightSide.gif");
        PIXI.loader.add("rightTop", "assets/rightTop.gif");

        PIXI.loader.add("cell", "assets/cell.gif");
        PIXI.loader.add("cellBomb", "assets/cellBomb.gif");
        PIXI.loader.add("cellBombCross", "assets/cellBombCross.gif");
        PIXI.loader.add("cellExplosion", "assets/cellExplosion.gif");
        PIXI.loader.add("cellFlag", "assets/cellFlag.gif");

        for (let i = 0; i <= 8; i++) {
            PIXI.loader.add("cell0" + i, "assets/cell0" + i + ".gif");
        }
    }
}