import { Update, Start } from "./ExecutionOrderController";
import {  injectable } from "inversify";

enum State {
    Hide,
    Show
}

@injectable()
export class Message implements Update, Start {
    
    public get container(): PIXI.Container {
        return this._container;
    }

    private _state: State = State.Hide;

    private readonly _container: PIXI.Container = new PIXI.Container();
    private readonly _cloud: PIXI.Graphics = new PIXI.Graphics();
    
    private _text: PIXI.Text = new PIXI.Text('', {fontFamily : 'Arial', fontSize: 18, fill : 0x000000, align:'center'});

    public constructor() {

    }

    public start(): void {
        this.drawCloud();
        this.setText();
    }

    private setText(): void {
        this._text.x = 0;
        this._text.y = -35;
        this._text.anchor.set(0.5, 0);
    }

    private drawCloud(): void {
        this._cloud.lineStyle(2, 0x31302C, 1);
        this._cloud.beginFill(0xFFFFCB, 1);
        this._cloud.drawRoundedRect(-200, -50, 400, 50, 15);
        this._cloud.endFill();
    }

    public showMessage(text: string): void {
        this._container.scale = new PIXI.Point(0, 0);
        this._state = State.Show;
        this._text.text = text;
        this._container.addChild(this._cloud);
        this._container.addChild(this._text);
    }

    public hideMessage(): void {
        this._state = State.Hide;
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
                this._container.removeChild(this._cloud);
                this._container.removeChild(this._text);
            }
        }
    }
}