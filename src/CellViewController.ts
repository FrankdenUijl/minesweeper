import { Cell }  from "./Cell";
import { injectable, inject } from "inversify";
import { Board, BoardStatus } from "./Board";
import { Start, Awake } from "./ExecutionOrderController";
import { EmoticonButton } from "./EmoticonButton";

@injectable()
export class CellViewController implements Awake, Start {
    
    public get container(): PIXI.Container {
        return this._container;
    }
    
    private _cell: Cell;

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite: PIXI.Sprite  = new PIXI.Sprite();

    private readonly _board: Board;
    private readonly _emoticonButton: EmoticonButton;
    
    public constructor(@inject(Board) board: Board,
        @inject(EmoticonButton) emoticonButton: EmoticonButton)
    {
        this._board = board;
        this._emoticonButton = emoticonButton;
    }

    public init(cell: Cell): void {
        this._cell = cell;
    }

    public awake(): void {
        this.setEvents();
    }

    public start(): void {
        this.initSprite();
    }

    private setEvents(): void {

        this._board.OnNewBoardStatus.subscribe(() => {
            if(this._board.status == BoardStatus.Dead) {

                if(this._cell.isMine && this._cell.isRevealed) {
                    this._sprite.texture = PIXI.utils.TextureCache["cellExplosion"];
                }

                if(this._cell.isMine && !this._cell.isFlagged && !this._cell.isRevealed) {
                    this._sprite.texture = PIXI.utils.TextureCache["cellBomb"];
                }

                if(!this._cell.isMine && this._cell.isFlagged) {
                    this._sprite.texture = PIXI.utils.TextureCache["cellBombCross"];
                }

                this._sprite.interactive = false;
                this._sprite.buttonMode = false;
            }

            if(this._board.status == BoardStatus.Win) {
                if(this._cell.isMine) {
                    this._sprite.texture = PIXI.utils.TextureCache["cellFlag"];
                }

                this._sprite.interactive = false;
                this._sprite.buttonMode = false;
            }
        })

        this._cell.OnRevealed.subscribe(() => { 
            this.onRevealed(); 
        });

        this._cell.OnRemove.subscribe(() => { 
            this.onRemove(); 
        });

        this._cell.OnFlagChange.subscribe(() => { 
            if(this._cell.isFlagged) {
                this._sprite.texture = PIXI.utils.TextureCache["cellFlag"];
            } else {
                this._sprite.texture = PIXI.utils.TextureCache["cell"];
            }
        });

        this._sprite.on('pointerdown', (e) => { 
            this._sprite.texture = !this._cell.isFlagged ? PIXI.utils.TextureCache["cell00"] : PIXI.utils.TextureCache["cellFlag"];
            this._emoticonButton.setSuprised(true);
        });

        this._sprite.on('pointerupoutside', () => { 
            this._emoticonButton.setSuprised(false);
        });

        this._sprite.on('pointerout', () => { 
            if(!this._cell.isRevealed && !this._cell.isFlagged) {
                this._sprite.texture = PIXI.utils.TextureCache["cell"];
            }

            if(this._cell.isFlagged) {
                this._sprite.texture = PIXI.utils.TextureCache["cellFlag"];
            }
        });

        this._sprite.on('pointerover', (event:PIXI.interaction.InteractionEvent ) => { 
            if(event.data.pressure != 0 && !this._cell.isFlagged) {
                this._sprite.texture = PIXI.utils.TextureCache["cell00"];
            }
        });

        this._sprite.on('pointerup', (e) => { 
            if(e.data.button == 0) {
                this._emoticonButton.setSuprised(false);

                if(!this._cell.isFlagged) {
                    this._cell.Reveal();
                }
            }

            if(e.data.button == 2) {
                if(this._cell.isRevealed) {
                    return;
                }
    
                this._emoticonButton.setSuprised(false);
    
                if(this._board.totalFlagsLeft != 0)
                {
                    this._cell.isFlagged = !this._cell.isFlagged;
                }
            }
        });

        
    }

    private initSprite()
    {
        this._sprite.texture = this._cell.isFlagged ? PIXI.utils.TextureCache["cellFlag"] : this._cell.isRevealed ? PIXI.utils.TextureCache["cell0" + this._board.GetCellNumber(this._cell)] : PIXI.utils.TextureCache["cell"];

        this._sprite.anchor.set(0);
        this._container.addChild(this._sprite);

        this._sprite.x = this._cell.position.x * this._sprite.width;
        this._sprite.y = this._cell.position.y * this._sprite.height;

        this._sprite.interactive = true;
        this._sprite.buttonMode = true;
    }

    private onRevealed(): void {
        this._sprite.texture = PIXI.utils.TextureCache["cell0" + this._board.GetCellNumber(this._cell)];

        this._sprite.interactive = false;
        this._sprite.buttonMode = false;
    }

    private onRemove(): void {
        this._sprite.interactive = false;
        this._sprite.buttonMode = false;

        this._container.removeChild(this._sprite);
    }
}