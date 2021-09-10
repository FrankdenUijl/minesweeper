import { Board, BoardStatus } from "./Board";
import { inject, injectable } from "../node_modules/inversify";
import { CellPosition } from "./CellPosition";
import { Cell } from "./Cell";
import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { Awake } from "./ExecutionOrderController";

@injectable()
export class SimpleBot implements Awake {

    public get OnStart(): ILiteEvent<{}> { 
        return this._onStart; 
    }

    public get OnStop(): ILiteEvent<{}> { 
        return this._onStop; 
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    private _timer: any[] = [];
    private _isRunning: boolean;

    private readonly _onStart = new LiteEvent<{}>();
    private readonly _onStop = new LiteEvent<{}>();

    private readonly _board: Board;

    public constructor(@inject(Board) board: Board) {
        this._board = board;
    }

    public awake(): void {
        this._board.OnNewBoardStatus.subscribe((oldStatus) => {
            if(!(this._board.status == BoardStatus.Playing || this._board.status == BoardStatus.WaitToPlay) && this._isRunning) {
                this.stopBot();
            }
        });
    }

    public startBot(): void {       
        if(this._isRunning) {
            throw new Error("Bot already running.");
        }

        this._isRunning = true;

        this._onStart.invoke();

        this.revealCorrectCell();
    }

    public stopBot(): void {
        if(!this._isRunning) {
            throw new Error("Bot is not running.");
        }
        
        this._isRunning = false;
        this._timer.forEach(t => clearTimeout(t));
        this._timer = [];

        this._onStop.invoke();
    }

    private randomMove(): void {

        if(!this._isRunning) {
            return;
        }

        let randomPosition = new CellPosition(this.randomInt(0, this._board.width - 1), this.randomInt(0, this._board.height - 1));
        let cell = this._board.getCell(randomPosition);

        if(cell.isRevealed) {
            this.randomMove();
            return;
        }

        cell.Reveal();

        this._timer.push(setTimeout(() => { this.findFlags() }, 100));
    }

    private findFlags(): void {

        if(!this._isRunning) {
            return;
        }

        var knownFlags = this._board.getAllNewKnownFlags();

        if(knownFlags.length == 0) {
            this.randomMove();
            return;
        }

        for(let cell of knownFlags){
            if(!cell.isFlagged)
            {
                cell.isFlagged = true;
            }
        }

        this._timer.push(setTimeout(() => { this.revealCorrectCell() }, 100));
    }

    private revealCorrectCell(): void {

        if(!this._isRunning) {
            return;
        }

        var knowFreeCells = this._board.getAllKnowFreeCells();

        if(knowFreeCells.length == 0) {
            this.randomMove();
            return;
        }

        this.reveal(knowFreeCells);
    }

    private reveal(cells: Cell[]): void {

        if(!this._isRunning) {
            return;
        }

        var cell = cells.pop();

        if(!cell.isRevealed) {
            cell.Reveal();
        }

        if(cells.length != 0) {
            this._timer.push(setTimeout(() => { this.reveal(cells) }, 100));
            return;
        }

        this._timer.push(setTimeout(() => { this.findFlags() }, 100));
    }

    private randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
} 