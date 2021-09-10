import { Container, interfaces } from "inversify";
import { Board } from "./Board";
import { Cell } from "./Cell";
import { CellPosition } from "./CellPosition";
import { CellViewController } from "./CellViewController";
import { BoardViewController } from "./BoardViewController";
import { Game } from "./Game";
import { ExecutionOrderController, Update, Load, Start, Awake, OnResize } from "./ExecutionOrderController";
import { Clippy } from "./Clippy";
import { Message } from "./Message";
import { GameTime } from "./GameTime";
import { TopBar } from "./TopBar";
import { EmoticonButton } from "./EmoticonButton";
import { SimpleBot } from "./SimpleBot";
import { Pictogram } from "./Pictogram";
import { CellEditViewController } from "./CellEditViewController";

var container = new Container();
container.bind(Board)
    .toSelf()
    .inSingletonScope();

container.bind(Cell)
    .to(Cell);

container.bind(ExecutionOrderController)
    .toSelf()
    .inSingletonScope();

container.bind(CellViewController)
    .toSelf();

container.bind(CellEditViewController)
    .toSelf();

container.bind(Pictogram)
    .toSelf();

container.bind(Clippy)
    .toSelf()
    .inSingletonScope();
container.bind<Update>("Update")
    .toDynamicValue(ctx => ctx.container.get(Clippy))
    .inSingletonScope();
container.bind<Load>("Load")
    .toDynamicValue(ctx => ctx.container.get(Clippy))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(Clippy))
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(Clippy))
    .inSingletonScope();
container.bind<OnResize>("OnResize")
    .toDynamicValue(ctx => ctx.container.get(Clippy))
    .inSingletonScope();

container.bind(Message)
    .toSelf()
    .inSingletonScope();
container.bind<Update>("Update")
    .toDynamicValue(ctx => ctx.container.get(Message))
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(Message))
    .inSingletonScope();

container.bind(BoardViewController)
    .toSelf()
    .inSingletonScope();
container.bind<Load>("Load")
    .toDynamicValue(ctx => ctx.container.get(BoardViewController))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(BoardViewController))
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(BoardViewController))
    .inSingletonScope();

container.bind(EmoticonButton)
    .toSelf()
    .inSingletonScope();
container.bind<Load>("Load")
    .toDynamicValue(ctx => ctx.container.get(EmoticonButton))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(EmoticonButton))
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(EmoticonButton))
    .inSingletonScope();


container.bind(TopBar)
    .toSelf()
    .inSingletonScope();
container.bind<Load>("Load")
    .toDynamicValue(ctx => ctx.container.get(TopBar))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(TopBar))
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(TopBar))
    .inSingletonScope();

container.bind(Game)
    .toSelf()
    .inSingletonScope();
container.bind<Start>("Start")
    .toDynamicValue(ctx => ctx.container.get(Game))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(Game))
    .inSingletonScope();
container.bind<OnResize>("OnResize")
    .toDynamicValue(ctx => ctx.container.get(Game))
    .inSingletonScope();
container.bind<Load>("Load")
    .toDynamicValue(ctx => ctx.container.get(Game))
    .inSingletonScope();

container.bind(GameTime)
    .toSelf()
    .inSingletonScope();
container.bind<Update>("Update")
    .toDynamicValue(ctx => ctx.container.get(GameTime))
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(GameTime))
    .inSingletonScope();

container.bind(SimpleBot)
    .toSelf()
    .inSingletonScope();
container.bind<Awake>("Awake")
    .toDynamicValue(ctx => ctx.container.get(SimpleBot))
    .inSingletonScope();

container.bind<interfaces.Factory<Pictogram>>("Factory<Pictogram>")
    .toFactory(context => {
        return (texture: PIXI.Texture, name: string): Pictogram => {
            let pictogram = context.container.get(Pictogram);

            pictogram.init(texture, name);

            let executionOrderController = context.container.get(ExecutionOrderController);
            executionOrderController.add(pictogram);

            return pictogram;
        }
    });

container.bind<interfaces.Factory<CellEditViewController>>("Factory<CellEditViewController>")
    .toFactory(context => {
        return (cell: Cell): CellEditViewController => {
            let cellView = context.container.get(CellEditViewController);

            cellView.init(cell);

            let executionOrderController = context.container.get(ExecutionOrderController);
            executionOrderController.add(cellView);

            return cellView;
        }
    });


container.bind<interfaces.Factory<CellViewController>>("Factory<CellViewController>")
    .toFactory(context => {
        return (cell: Cell): CellViewController => {
            let cellView = context.container.get(CellViewController);

            cellView.init(cell);

            let executionOrderController = context.container.get(ExecutionOrderController);
            executionOrderController.add(cellView);

            return cellView;
        }
    });

container.bind<interfaces.Factory<Cell>>("Factory<Cell>")
    .toFactory(context => {
        return (position: CellPosition, isMine: boolean): Cell => {
            let cell = context.container.get(Cell);

            cell.init(position, isMine);

            return cell;
        }
    });

export default container;