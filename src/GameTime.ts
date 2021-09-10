import { Update, Awake } from "./ExecutionOrderController";
import { injectable, inject } from "inversify";
import { Board, BoardStatus } from "./Board";
import { ILiteEvent, LiteEvent } from "./LiteEvent";

@injectable()
export class GameTime implements Update, Awake {
    
    public get OnTick(): ILiteEvent<{}> { 
        return this._onTime.expose(); 
    } 

    public get time(): number {

        if(Math.floor(this._time / 100) > 999 ) {
            return 999;
        }

        return Math.floor(this._time / 100);
    }

    private _time: number = 0;
    private readonly _board: Board;
    private readonly _onTime = new LiteEvent();

    public constructor(@inject(Board) board: Board) {
        this._board = board;
    }

    public awake(): void {
        this._board.OnNewBoardStatus.subscribe(() => {
            if(this._board.status == BoardStatus.Empty) {
                this._time = 0;

                this._onTime.invoke();
            }
        });
    }
    
    public update(deltaTime: number): void
    {
        if(this._board.status == BoardStatus.Playing) {
            
            var oldTime = this.time;
            
            this._time+= deltaTime * 2;

            if(oldTime < this.time) {
                this._onTime.invoke();
            }
        }
    }

}