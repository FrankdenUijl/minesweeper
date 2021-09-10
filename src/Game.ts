import "reflect-metadata";
import PIXI = require("pixi.js");
import { inject, injectable, interfaces } from "inversify";
import { Board, BoardStatus } from "./Board";
import { Cell } from "./Cell";
import { BoardViewController } from "./BoardViewController";
import { Start, Awake, OnResize, Load } from "./ExecutionOrderController";
import { Clippy } from "./Clippy";
import { EmoticonButton } from "./EmoticonButton";
import { Pictogram } from "./Pictogram";
import { SimpleBot } from "./SimpleBot";

@injectable()
export class Game implements Awake, Start, OnResize, Load {
    
    public get container(): PIXI.Container {
        return this._container;
    }

    private _container: PIXI.Container = new PIXI.Container();

    private _startBot: Pictogram;
    private _endBot: Pictogram;

    private _beginner: Pictogram;
    private _intermediate: Pictogram;
    private _expert: Pictogram;

    private _load: Pictogram;
    private _save: Pictogram;
    private _editor: Pictogram;

    private _website: Pictogram;
    private _source: Pictogram;
    private _hireMe: Pictogram;

    private _savedMap: string;

    private readonly _board: Board;
    private readonly _boardView: BoardViewController;
    private readonly _clippy: Clippy;
    private readonly _emoticonButton: EmoticonButton;
    private readonly _pictogramFactory: interfaces.Factory<Pictogram>;
    private readonly _simpleBot: SimpleBot;

    public constructor(@inject(Board) board: Board,
        @inject(BoardViewController) boardView: BoardViewController,
        @inject(Clippy) clippy: Clippy,
        @inject(EmoticonButton) emoticonButton: EmoticonButton,
        @inject("Factory<Pictogram>") pictogramFactory: (texture: PIXI.Texture, name: string) => Pictogram,
        @inject(SimpleBot) simpleBot: SimpleBot) {
        this._board = board;
        this._boardView = boardView;
        this._clippy = clippy;
        this._emoticonButton = emoticonButton;
        this._pictogramFactory = pictogramFactory;
        this._simpleBot = simpleBot;
    }

    public awake() {
        this._board.OnNewCell.subscribe((cell) => { 
            this.onNewCell(cell) 
        });

        this._boardView.OnStartResize.subscribe((cell) => { 
            this.removeCells() 
        });

        this._boardView.OnEndResize.subscribe((width, height) => { 
            this.onEndResize(width, height) 
        });

        this._boardView.OnShake.subscribe((cell) => { 
            this.removeCells() 
        });

        this._emoticonButton.OnPressed.subscribe(() => {
            this.newGame();
        });
    }

    public start() {
        this._board.SetCells(9, 9, 10);

        
        this.setBotPictograms();
        this.setModePictograms();
        this.setEditorButtons();
        this.setLinkToSellMySelf();
        
        this._container.addChild(this._clippy.container);
        this._container.addChild(this._boardView.container);
    }

    private setLinkToSellMySelf(): void {
        this._website = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["internetPictogram"], "Portfolio");
        this._source = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["internetPictogram"], "Github");
        this._hireMe = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["logPictogram"], "Hire me!");

        this._website.container.x = window.innerWidth - 50;
        this._website.container.y = 310;

        this._source.container.x = window.innerWidth - 120;
        this._source.container.y = 310;

        this._hireMe.container.x = window.innerWidth - 190;
        this._hireMe.container.y = 310;

        this._website.OnPressed.subscribe(() => {
            window.open("https://frankdenuijl.nl",'_blank');
        });

        this._source.OnPressed.subscribe(() => {
            window.open("https://github.com/FrankdenUijl/minesweeper",'_blank');
        })

        this._hireMe.OnPressed.subscribe(() => {
            window.open("https://frankdenuijl.nl/wp-content/uploads/2021/09/FrankDenUijlResume-4.pdf",'_blank');
        });

        this._container.addChild(this._website.container);
        this._container.addChild(this._source.container);
        this._container.addChild(this._hireMe.container);
    }

    private setBotPictograms(): void {
        this._startBot = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["iniPictogram"], "Start Bot");
        this._endBot = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["iniPictogram"], "End Bot");
        
        this._endBot.isInteractive = false;

        this._startBot.container.x = window.innerWidth - 50;
        this._startBot.container.y = 50;

        this._endBot.container.x = window.innerWidth - 120;
        this._endBot.container.y = 50;

        this._simpleBot.OnStart.subscribe(() => {
            this._endBot.isInteractive = true;
            this._startBot.isInteractive = false;
        });

        this._simpleBot.OnStop.subscribe(() => {
            this._endBot.isInteractive = false;
            this._startBot.isInteractive = true;
        });

        this._startBot.OnPressed.subscribe(() => {
            this._simpleBot.startBot();
        });

        this._endBot.OnPressed.subscribe(() => {
            this._simpleBot.stopBot();
        });

        this._container.addChild(this._startBot.container);
        this._container.addChild(this._endBot.container);

        this._board.OnNewBoardStatus.subscribe((cell) => { 

            if(this._board.status == BoardStatus.Dead || 
                this._board.status == BoardStatus.Editor ||
                this._board.status == BoardStatus.Win ||
                this._board.status == BoardStatus.Empty) {
                this._endBot.isInteractive = false;
                this._startBot.isInteractive = false;
            } else {
                this._endBot.isInteractive = this._simpleBot.isRunning;
                this._startBot.isInteractive = !this._simpleBot.isRunning;;
            }
        });
    }

    private setModePictograms(): void {
        this._beginner = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["logPictogram"], "Beginner");
        this._intermediate = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["logPictogram"], "Intermediate");
        this._expert = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["logPictogram"], "Expert");

        this._beginner.container.x = window.innerWidth - 50;
        this._beginner.container.y = 120;

        this._intermediate.container.x = window.innerWidth - 120;
        this._intermediate.container.y = 120;

        this._expert.container.x = window.innerWidth - 190;
        this._expert.container.y = 120;

        this._beginner.OnPressed.subscribe(() => {
            if(this._board.totalCells != 0) {
                this._board.RemoveCells();
            }

            this._board.SetCells(9, 9, 9);
        });

        this._intermediate.OnPressed.subscribe(() => {
            if(this._board.totalCells != 0) {
                this._board.RemoveCells();
            }

            this._board.SetCells(16, 16, 40);
        });

        this._expert.OnPressed.subscribe(() => {
            if(this._board.totalCells != 0) {
                this._board.RemoveCells();
            }

            this._board.SetCells(16, 30, 99);
        });

        this._container.addChild(this._beginner.container);
        this._container.addChild(this._intermediate.container);
        this._container.addChild(this._expert.container);
    }

    private setEditorButtons() {
        this._load = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["colorPictogram"], "Load");
        this._save = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["colorPictogram"], "Save");
        this._editor = <Pictogram>this._pictogramFactory(PIXI.utils.TextureCache["colorPictogram"], "Editor");

        this._load.container.x = window.innerWidth - 50;
        this._load.container.y = 190;

        this._save.container.x = window.innerWidth - 120;
        this._save.container.y = 190;

        this._editor.container.x = window.innerWidth - 190;
        this._editor.container.y = 190;

        this._load.isInteractive = false;

        this._load.OnPressed.subscribe(() => {
            this._board.Deserialize(this._savedMap);
        });

        this._save.OnPressed.subscribe(() => {
            this._load.isInteractive = true;

            this._savedMap = this._board.Serialize();
        });

        this._editor.OnPressed.subscribe(() => {
            if(this._board.totalCells != 0) {
                this._board.RemoveCells();
            }

            this._board.setEditor(this._boardView.width / this.cellSize(), 
                this._boardView.height / this.cellSize());
        });

        this._board.OnNewBoardStatus.subscribe((cell) => { 

            if(this._board.status == BoardStatus.Dead ||
                this._board.status == BoardStatus.Win ||
                this._board.status == BoardStatus.Empty) {
                this._save.isInteractive = false;
            } else {
                this._save.isInteractive = true;
            }
        });

        this._container.addChild(this._load.container);
        this._container.addChild(this._save.container);
        this._container.addChild(this._editor.container);
    }

    public onResize() {
        this._startBot.container.x = window.innerWidth - 50;
        this._endBot.container.x = window.innerWidth - 120;

        this._beginner.container.x = window.innerWidth - 50;
        this._intermediate.container.x = window.innerWidth - 120;
        this._expert.container.x = window.innerWidth - 190;

        this._load.container.x = window.innerWidth - 50;
        this._save.container.x = window.innerWidth - 120;
        this._editor.container.x = window.innerWidth - 190;

        this._website.container.x = window.innerWidth - 50;
        this._source.container.x = window.innerWidth - 120;
        this._hireMe.container.x = window.innerWidth - 190;
    }

    private removeCells() {
        if(this._board.totalCells != 0) {
            this._board.RemoveCells();
        }
    }

    private onEndResize(width: number, height: number) {
        this._board.SetCells(width, height, this._board.totalMines);
    }

    private cellSize(): number {
        return PIXI.utils.TextureCache["cell"].width;
    }

    private newGame() {
        if(this._board.totalCells != 0) {
            this._board.RemoveCells();
        }

        this._board.SetCells(this._boardView.width / this.cellSize(), 
            this._boardView.height / this.cellSize(), 
            this._board.totalMines);
    }

    private onNewCell(cell: Cell) {
        cell.OnRevealed.subscribe((cell) => { 
            this.onCellRevealed(cell) 
        });
    }

    private onCellRevealed(cell: Cell) {
        if(cell.isMine){
            this._board.gameOver(BoardStatus.Dead);
        } else if(this._board.totalMines == this._board.totalCells - this._board.totalRevealed) {
            this._board.gameOver(BoardStatus.Win);
        } else if(!this._board.HasCellNumber(cell)){
            this._board.revealNeighbors(cell);
        }
    }

    public load(): void {
        PIXI.loader.add("colorPictogram", "assets/color.png");
        PIXI.loader.add("iniPictogram", "assets/ini.png");
        PIXI.loader.add("pdfPictogram", "assets/pdf.png");
        PIXI.loader.add("portfolioPictogram", "assets/portfolio.png");
        PIXI.loader.add("internetPictogram", "assets/internet.png");
        PIXI.loader.add("logPictogram", "assets/log.png");
    }
}