import "reflect-metadata";
import { assert } from "chai";
import { Cell } from "../src/Cell";
import { CellPosition } from "../src/CellPosition";
import container from "../src/inversify.config";
import { interfaces } from "inversify";

describe("Cell", () =>
{
    it("Constructor", (done) =>
    {
        let isMine = true;
        let cellPosition = new CellPosition(1, 2);
        let cellFactory = container.get<interfaces.Factory<Cell>>("Factory<Cell>");
        let cell = <Cell>cellFactory(cellPosition, isMine);

        assert.isTrue(cell.position == cellPosition, "position is not set");
        assert.isTrue(cell.isMine == isMine, "isMine is not set");

        done();
    });

    it("IsFlagged", (done) =>
    {
        let isMine = true;
        let cellPosition = new CellPosition(1, 2);
        let cellFactory = container.get<interfaces.Factory<Cell>>("Factory<Cell>");
        let cell = <Cell>cellFactory(cellPosition, isMine);

        assert.isTrue(!cell.isFlagged, "isFlagged should be false");
        cell.isFlagged = true;
        assert.isTrue(cell.isFlagged, "isFlagged should be true");

        done();
    });

    it("IsFlagged exceptions", (done) =>
    {
        let isMine = true;
        let cellPosition = new CellPosition(1, 2);
        let cellFactory = container.get<interfaces.Factory<Cell>>("Factory<Cell>");
        let cell = <Cell>cellFactory(cellPosition, isMine);
        
        assert.throws(() => { cell.isFlagged = false});
        cell.Reveal();
        assert.throws(() => { cell.isFlagged = true});

        done();
    });

    it("Reveal", (done) =>
    {
        let isMine = true;
        let cellPosition = new CellPosition(1, 2);
        let cellFactory = container.get<interfaces.Factory<Cell>>("Factory<Cell>");
        let cell = <Cell>cellFactory(cellPosition, isMine);

        assert.isTrue(!cell.isRevealed, "isRevealed should be false");
        cell.Reveal();
        assert.isTrue(cell.isRevealed, "isRevealed should be true");

        done();
    });

    it("Reveal Excpetion", (done) =>
    {
        let isMine = true;
        let cellPosition = new CellPosition(1, 2);
        let cellFactory = container.get<interfaces.Factory<Cell>>("Factory<Cell>");
        let cell = <Cell>cellFactory(cellPosition, isMine);

        cell.Reveal();
        assert.throws(() => cell.Reveal());

        done();
    });
});