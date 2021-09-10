import { LiteEvent, ILiteEvent } from "./LiteEvent";

export enum Direction {
    Horizontal,
    Vertical
}

export class Border {
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

    public get width(): number {
        return this._background.width;
    }

    public set width(width: number) {
        this.setSizeOfBorders(width, this.height);
    }

    public get height(): number {
        return this._background.height;
    }

    public set height(height: number) {
        this.setSizeOfBorders(this.width, height);
    }

    private _isDragging: boolean;
    private _mouseData: PIXI.interaction.InteractionData;
    private _startPoint: PIXI.Point;

    private _background: PIXI.extras.TilingSprite;
    private _start: PIXI.Sprite;
    private _end: PIXI.Sprite;
    private _direction: Direction;

    private readonly _container: PIXI.Container = new PIXI.Container();

    private readonly _onDragStart = new LiteEvent<PIXI.interaction.InteractionData>();
    private readonly _onDragEnd = new LiteEvent<PIXI.Point, PIXI.interaction.InteractionData>();
    private readonly _onDragMove = new LiteEvent<PIXI.Point, PIXI.interaction.InteractionData>();

    public init(backgroundTexture: PIXI.Texture, 
        startTexture: PIXI.Texture,
        endTexture: PIXI.Texture,
        width: number,
        height: number,
        direction: Direction,
        interactive: boolean): void {

        this._background = new PIXI.extras.TilingSprite(backgroundTexture);
        this._start = new PIXI.Sprite(startTexture);
        this._end = new PIXI.Sprite(endTexture);
        this._direction = direction;
    
        this.setSizeOfBorders(width, height);
        this._container.addChild(this._background);

        if(interactive)
        {
            this.setEvent();
        }

        if(this._direction == Direction.Horizontal)
        {
            this._container.addChild(this._start);
            this._container.addChild(this._end);
        }
    }

    private setEvent(): void {
        this._container.interactive = true;
        this._container.cursor = this._direction == Direction.Vertical ? "ew-resize" : "ns-resize";

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

    private setSizeOfBorders(width: number, height: number): void {
        this._background.width = width;
        this._background.height = height;

        if(this._direction == Direction.Horizontal)
        {
            this._start.anchor.x = 1;
            this._start.anchor.y = 0;
            this._start.x = 0;

            this._end.anchor.x = 0;
            this._end.anchor.y = 0;
            this._end.x = width;
        }

        if(this._direction == Direction.Vertical)
        {
            this._start.anchor.x = 0;
            this._start.anchor.y = 1;
            this._start.y = 0;

            this._end.anchor.x = 0;
            this._end.anchor.y = 0;
            this._end.y = height;
        }
    }
}