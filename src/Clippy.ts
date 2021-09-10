import { Awake, Load, Start, Update, OnResize } from "./ExecutionOrderController";
import { injectable, inject } from "inversify";
import { Message } from "./Message";
import { debug } from "console";

enum State {
    Hide,
    Show
}

@injectable()
export class Clippy implements Load, Awake, Start, Update, OnResize {
    
    public get container(): PIXI.Container {
        return this._container;
    }

    private _state: State = State.Hide;

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _sprite: PIXI.Sprite = new PIXI.Sprite();
    private readonly _message: Message;

    public constructor(@inject(Message) message: Message) {
        this._message = message;
    }

    public load(): void
    {
        PIXI.loader.add("Clippy", "assets/Clippy.png");
    }    

    public awake(): void
    {
        this._container.addChild(this._message.container);

        this._message.container.x = -250;
        this._message.container.y = -200;
    }

    public start(): void
    {
        this._sprite.texture = PIXI.utils.TextureCache["Clippy"];
        this._sprite.scale = new PIXI.Point(0.5, 0.5);
        this._sprite.anchor.x = 1;
        this._sprite.anchor.y = 1;

        this._container.interactive = true;
        this._container.buttonMode = true;

        this._container.x = window.innerWidth - 20;
        this._container.y = window.innerHeight - 20;
        this._container.scale = new PIXI.Point(0, 0);

        this._container.on('pointerdown', (e) => { 

            if(e.data.button == 0)
            {
                if(this._state == State.Show)
                {
                    this._message.showMessage(this.getRandomMessage());
                }
            }

            if(e.data.button == 2)
            {
                if(this._state == State.Show)
                {
                    this.hide();
                }
            }
        });

        this.show();
    }

    private getRandomMessage(): string {
        var things = ['Resize the minesweeper window!', 
            'Get help from the minesweeper Bot!', 
            'Create your favorite maps and play them!',
            'Try to beat the game on Expert!',
            'Right click to hide me',
            'See the source code on github!'];

        return things[Math.floor(Math.random()*things.length)];
    }

    public onResize(): void
    {
        this._container.x = window.innerWidth - 20;
        this._container.y = window.innerHeight - 20;
    }

    private hide(): void {
        this._state = State.Hide;
    }

    private show(): void {
        this._state = State.Show;

        this._container.addChild(this._sprite);
    }

    public update(deltaTime: number): void
    {
        if(this._state == State.Show && this._container.scale.x < 1)
        {
            this._container.scale.x+= deltaTime * 0.1;
            this._container.scale.y+= deltaTime * 0.1;
        }

        if(this._state == State.Hide)
        {
            this._container.scale.x-= deltaTime * 0.1;
            this._container.scale.y-= deltaTime * 0.1;

            if(this._container.scale.x < 0)
            {
                this._container.removeChild(this._sprite);
            }
        }
    }
}