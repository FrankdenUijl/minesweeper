import { CellPosition }  from "./CellPosition";
import { injectable } from "inversify";
import { LiteEvent, ILiteEvent } from "./LiteEvent";
import { Skip, Type } from "serializer.ts/Decorators";

@injectable()
export class Cell {
    @Type(() => CellPosition)
    private _position: CellPosition;

    private _isMine: boolean = false;
    private _isFlagged: boolean = false;
    private _isRevealed: boolean = false;
    private _isRemoved: boolean = false;

    @Skip()
    private _number: number = -1;

    @Skip()
    private _neightbors: Cell[] = [];

    @Skip()
    private readonly _onFlagChange = new LiteEvent<Cell>();

    @Skip()
    private readonly _onRevealed = new LiteEvent<Cell>();

    @Skip()
    private readonly _onRemove = new LiteEvent<Cell>();

    @Skip()
    private readonly _onMineChanged = new LiteEvent<Cell>();

    @Skip()
    public get OnMineChange(): ILiteEvent<Cell> { 
        return this._onMineChanged.expose(); 
    } 

    @Skip()
    public get OnFlagChange(): ILiteEvent<Cell> { 
        return this._onFlagChange.expose(); 
    } 

    @Skip()
    public get OnRevealed(): ILiteEvent<Cell> { 
        return this._onRevealed.expose(); 
    }

    @Skip()
    public get OnRemove(): ILiteEvent<Cell> { 
        return this._onRemove.expose(); 
    }

    @Skip()
    public get position(): CellPosition
    {
        return this._position;
    }

    @Skip()
    public get isMine(): boolean
    {
        return this._isMine;
    }

    @Skip()
    public get isFlagged(): boolean {
        return this._isFlagged;
    }

    @Skip()
    public get number(): number {
        return this._number;
    }

    @Skip()
    public get neighbors(): Cell[] {
        return this._neightbors;
    }

    public set isFlagged(isFlagged:boolean) {
        if(this._isFlagged == isFlagged) {
            throw new Error("Cells isFlagged is already: " + isFlagged);
        }

        if(this._isRevealed) {
            throw new Error("Cell is already revealed");
        }

        this._isFlagged = isFlagged;

        this._onFlagChange.invoke(this);
    }

    @Skip()
    public get isRevealed(): boolean {
        return this._isRevealed;
    }

    @Skip()
    public get isRemoved(): boolean {
        return this._isRemoved;
    }

    public init(position: CellPosition, isMine: boolean) {
        this._position = position;
        this._isMine = isMine;
    }

    public Reveal(): void {
        if(this._isRevealed) {
            throw new Error("Cell is already revealed");
        }

        this._isRevealed = true;

        this._onRevealed.invoke(this);
    }

    public Remove(): void {
        if(this._isRemoved) {
            throw new Error("Cell is already removed");
        }

        this._isRemoved = true;

        this._onRemove.invoke(this);
    }


    public SetNumber(number: number): void {
        if(this._number != -1) {
            throw new Error("Number already set");
        }

        this._number = number;
    }
    
    public SetNeighbors(neightbors: Cell[]): void {
        if(this._neightbors.length != 0) {
            throw new Error("neightbors already set");
        }

        this._neightbors = neightbors;
    }

    public SetMine(isMine: boolean): void {

        if(this._isMine == isMine) {
            throw new Error("Mine is already " + isMine);
        }

        this._isMine = isMine;

        this._onMineChanged.invoke();
    }
}