import "reflect-metadata";
import PIXI = require("pixi.js");
import container  from "./inversify.config";
import { ExecutionOrderController } from "./ExecutionOrderController";
import { Game } from "./Game";

//WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by the browser then this function will return a canvas renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { "backgroundColor": 0x008080 });
document.body.appendChild(renderer.view);
document.body.style.margin = "0px";
document.body.style.overflow = "hidden";
document.body.oncontextmenu = () => { event.preventDefault(); }

//class that controls the execution order of event Functions (load, awake, start and update)
var executionOrderController = container.get(ExecutionOrderController);

executionOrderController.load();
executionOrderController.awake();

PIXI.loader.load(() =>
{
    executionOrderController.start();

    //Add all update bindings to the ticker
    PIXI.ticker.shared.add(executionOrderController.update, executionOrderController);
});

//Get the game container
var gameContainer = container.get(Game).container;

var render = () => {
    renderer.render(gameContainer);
    window.requestAnimationFrame(render);
}

render();

//This controls the resizing of the window
window.addEventListener("resize", () => {
        executionOrderController.onResize();
        renderer.resize(window.innerWidth, window.innerHeight);
    });