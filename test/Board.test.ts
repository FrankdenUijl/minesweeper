import "reflect-metadata";
import { assert } from "chai";
import { Board } from "../src/Board";
import container  from "../src/inversify.config";
import { CellPosition } from "../src/CellPosition";

describe("Board", () =>
{
    it("Constructor", (done) =>
    {
        var board = container.get(Board);

        assert.isTrue(board.width == 0, "Board isn't empty");
        assert.isTrue(board.height == 0, "Board isn't empty");
        assert.isTrue(board.totalMines == 0, "Board isn't empty");
        assert.isTrue(board.totalCells == 0, "Board isn't empty");

        done();
    });

    it("SetCells", (done) =>
    {
        var width = 13;
        var height = 7;
        var mines = 20;

        var board = container.get(Board);

        board.SetCells(width, height, mines);

        assert.isTrue(board.width == width, "Board width isn't correct");
        assert.isTrue(board.height == height, "Board height isn't correct");
        assert.isTrue(board.totalMines == mines, "Board total mines isn't correct");
        assert.isTrue(board.totalCells == width * height, "Board total cells isn't correct");

        done();
    });

    it("Serialize and deserialize", (done) =>
    {
        var width = 13;
        var height = 7;
        var mines = 20;

        var board = container.get(Board);

        board.SetCells(width, height, mines);

        let json = board.Serialize();

        board.Deserialize(json);

        assert.isTrue(board.width == width, "Board width isn't correct");
        assert.isTrue(board.height == height, "Board height isn't correct");
        assert.isTrue(board.totalMines == mines, "Board total mines isn't correct");
        assert.isTrue(board.totalCells == width * height, "Board total cells isn't correct");

        done();
    });
});