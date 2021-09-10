import "reflect-metadata";
import { List } from 'linqts';

export class CellPosition {
    public static readonly neighborPositions: CellPosition[] = [new CellPosition(-1,-1), 
        new CellPosition(-1,0),
        new CellPosition(-1,1),
        new CellPosition(0,-1),
        new CellPosition(1,-1),
        new CellPosition(1,1),
        new CellPosition(1,0),
        new CellPosition(0,1)]; 
    
    public readonly x: number;
    public readonly y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public IsEqual(a: CellPosition): boolean {
        return this.x == a.x && this.y == a.y;
    }

    public static Add(a: CellPosition, b: CellPosition): CellPosition {
        return new CellPosition(a.x + b.x, a.y + b.y);
    }

    public static IsEqual(a: CellPosition, b: CellPosition): boolean {
        return a.IsEqual(b);
    }

    public static Neighbors(position: CellPosition): CellPosition[] {
        return new List<CellPosition>(CellPosition.neighborPositions)
            .Select(p => CellPosition.Add(position, p))
            .ToArray();
    }
}