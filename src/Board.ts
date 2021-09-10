import { injectable, inject, interfaces } from "inversify";
import { Cell } from "./Cell";
import { CellPosition}  from "./CellPosition";
import { List } from "linqts";
import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { serialize, deserialize } from "serializer.ts/Serializer";

export enum BoardStatus {
    WaitToPlay,
    Playing,
    Dead,
    Win,
    Empty,
    Editor
}

@injectable()
export class Board {
    public get OnNewCell(): ILiteEvent<Cell> { 
        return this._onNewCell; 
    }

    public get OnCellFlagged(): ILiteEvent<Cell> { 
        return this._onCellFlagged.expose(); 
    } 

    public get OnNewBoardStatus(): ILiteEvent<BoardStatus> { 
        return this._onNewBoardStatus.expose(); 
    } 

    public get width(): number {
        if(this._cells.length == 0) {
            return 0;
        }

        return new List<Cell>(this._cells).Max(c => c.position.x) + 1;
    }

    public get height(): number {
        if(this._cells.length == 0) {
            return 0;
        }

        return new List<Cell>(this._cells).Max(c => c.position.y) + 1;
    }

    public get totalMines(): number {   
        return this._totalMines;
    }

    public get totalFlags(): number {   
        return this._cells.filter(c => c.isFlagged).length;
    }

    public get totalFlagsLeft(): number {
        return this.totalMines - this.totalFlags;
    }

    public get totalRevealed(): number {   
        return this._cells.filter(c => c.isRevealed).length;
    }

    public get totalCells(): number {
        return this._cells.length;
    }

    public get status(): number {
        return this._status;
    }

    private _cells: Cell[] = [];
    private _totalMines: number = 0;
    private _status: BoardStatus = BoardStatus.Empty;

    private readonly _onNewCell = new LiteEvent<Cell>();
    private readonly _onCellFlagged = new LiteEvent<Cell>();
    private readonly _onNewBoardStatus = new LiteEvent<BoardStatus>();
    
    private readonly _cellFactory: interfaces.Factory<Cell>;

    public constructor(@inject("Factory<Cell>") cellFactory: (position: CellPosition, isMine: boolean) => Cell) {
        this._cellFactory = cellFactory;
    }

    public gameOver(status: BoardStatus): void {
        this.setStatus(status);
    }

    public Serialize(): string {
        return serialize(this._cells);
    }

    public Deserialize(json: string): void {
        this.RemoveCells();

        this._cells = deserialize<Cell[]>(Cell, json);

        for(let cell of this._cells) {
            this._onNewCell.invoke(cell);

            cell.OnFlagChange.subscribe(() => {

                if(this._status != BoardStatus.Playing) {
                    this.setStatus(BoardStatus.Playing);            
                }

                this._onCellFlagged.invoke(cell);
            });

            cell.OnRevealed.subscribe(() => {
                if(this._status == BoardStatus.WaitToPlay) {
                    this.setStatus(BoardStatus.Playing);            
                }
            });
        }

        this._totalMines = this._cells.filter(c => c.isMine).length

        this.setStatus(BoardStatus.WaitToPlay);
    }

    public getCell(position: CellPosition): Cell {
        return this._cells.find(c => CellPosition.IsEqual(position, c.position));
    }

    public getAllNewKnownFlags(): Cell[] {
        let allNumbers = this._cells.filter(c => c.isRevealed && this.HasCellNumber(c));

        let knownFlags: Cell[] = [];
        
        for(let numberCell of allNumbers){
            let neighbors = this.getNeighbors(numberCell).filter(c => !c.isRevealed);

            if(neighbors.length == this.GetCellNumber(numberCell))
            {
                knownFlags = knownFlags.concat(neighbors);
            }
        }
        
        return knownFlags.filter((el, i, a) => i === a.indexOf(el));
    }

    public getAllKnowFreeCells(): Cell[] {
        let allClosedCells = this._cells.filter(c => !c.isRevealed && !c.isFlagged);
        
        let knowFreeCells: Cell[] = [];
        for(var cell of allClosedCells){
            let neighborsWithZero = this.getNeighbors(cell).filter(c => c.isRevealed && this.HasCellNumber(c));

            if(neighborsWithZero.some(c => this.GetApproximateCellNumber(c) == 0)) {
                knowFreeCells.push(cell);
            }
        }

        return knowFreeCells;
    }

    public revealNeighbors(cell: Cell): void
    {
        if(!cell.isRevealed) {
            throw new Error("Cell himself isn't revealed!");
        }

        var neighbors = this.getNeighbors(cell);

        for(let cell of neighbors){
            if(cell.isMine || cell.isRevealed || cell.isFlagged) {
                continue;
            }

            cell.Reveal();
        }
    }

    public RemoveCells() {
        if(this.totalCells == 0) {
            throw new Error("No cells to free fall!");
        }
        
        for(let cell of this._cells) {
            cell.Remove();
        }

        this._cells = [];

        this.setStatus(BoardStatus.Empty);
    }

    public setEditor(width: number, height: number): void {
        
        this._status = BoardStatus.Editor;
        
        if(this.totalCells != 0) {
            throw new Error("Cells should be empty!");
        }

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                let position = new CellPosition(x, y);
                this._cells.push(this.createCell(position, false));
            }
        }
        
        this._totalMines = 0;
        this.setStatus(BoardStatus.Editor);
    }

    public SetCells(width: number, height: number, totalMines: number) : void {
        if(this.totalCells != 0) {
            throw new Error("Cells should be empty!");
        }

        this._totalMines = totalMines;

        var minePositions: CellPosition[] = [];
        for (var x = 0; x < this._totalMines; x++) {
            var isDuplicate: boolean = true;
            var position: CellPosition;
            while(isDuplicate) {
                position = new CellPosition(this.randomInt(0, width - 1), this.randomInt(0, height - 1));
                isDuplicate = minePositions.some(p => p.IsEqual(position));
            }
            minePositions.push(position);
        }

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                let position = new CellPosition(x, y);
                let isMine = minePositions.some(c => c.IsEqual(position));
                this._cells.push(this.createCell(position, isMine));
            }
        }

        this.setStatus(BoardStatus.WaitToPlay);
    }

    private randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private createCell(postion: CellPosition, isMine: boolean) : Cell
    {
        let cell = <Cell>this._cellFactory(postion, isMine);
        this._onNewCell.invoke(cell);

        cell.OnFlagChange.subscribe(() => {

            if(this._status != BoardStatus.Playing) {
                this.setStatus(BoardStatus.Playing);            
            }

            this._onCellFlagged.invoke(cell);
        });

        cell.OnRevealed.subscribe(() => {
            if(this._status == BoardStatus.WaitToPlay) {
                this.setStatus(BoardStatus.Playing);            
            }
        });

        return cell;
    }

    public HasCellNumber(cell: Cell): boolean {

        if(cell.number != -1) {
            return cell.number != 0;
        }

        var neighbors = this.getNeighbors(cell);
        cell.SetNumber(neighbors.filter(c => c.isMine).length);
        
        return cell.number != <number>0; 
    }

    public GetApproximateCellNumber(cell: Cell): number {
        var neighbors = this.getNeighbors(cell);

        return neighbors.filter(c => c.isMine && !c.isFlagged).length;
    }

    public GetCellNumber(cell: Cell): number {
        if(cell.number != -1) {
            return cell.number;
        }

        var neighbors = this.getNeighbors(cell);
        
        cell.SetNumber(neighbors.filter(c => c.isMine).length);
        return cell.number;
    }

    private setStatus(status: BoardStatus) {
        var oldStatus = this._status;

        this._status = status;

        this._onNewBoardStatus.invoke(oldStatus);
    }

    private getNeighbors(cell: Cell) : Cell[] {
        if(cell.neighbors.length != 0) {
            return cell.neighbors;
        }

        var neighborPositions = CellPosition.Neighbors(cell.position);
        cell.SetNeighbors( this._cells.filter(cell => neighborPositions.some(neighbor => CellPosition.IsEqual(neighbor, cell.position))));


        return cell.neighbors;
    }
}