import "reflect-metadata";
import { assert } from "chai";
import { CellPosition } from "../src/CellPosition";

describe("CellPosition", () =>
{
    it("Constructor", (done) =>
    {
        let x = 1;
        let y = 2;
        let cellPosition = new CellPosition(x, y);

        assert.isTrue(cellPosition.x == x, "x not correct");
        assert.isTrue(cellPosition.y == y, "y not correct");
        done();
    });

    it("Add", (done) =>
    {
        let x = 1;
        let y = 2;
        let cellPositionA = new CellPosition(x, y);
        let cellPositionB = new CellPosition(x, y);

        let answer = CellPosition.Add(cellPositionA, cellPositionB);

        assert.isTrue(answer.x == x + x, "x not correct");
        assert.isTrue(answer.y == y + y, "y not correct");
        done();
    });

    it("IsEqual", (done) =>
    {
        let x = 10;
        let y = 20;

        let cellPositionA = new CellPosition(x, y);
        let cellPositionB = new CellPosition(x, y);
        let cellPositionC = new CellPosition(x + 1, y - 1);

        assert.isTrue(CellPosition.IsEqual(cellPositionA, cellPositionB), "cellPositionA and cellPositionB should be the same");
        assert.isTrue(!CellPosition.IsEqual(cellPositionA, cellPositionC), "cellPositionA and cellPositionC shlould NOT be the same");
        done();
    });

    it("Neighbors", (done) =>
    {
        let x = 1;
        let y = 2;

        let cellPosition = new CellPosition(x, y);
        let neighbors = CellPosition.Neighbors(cellPosition);

        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[0]))), "Neighbor 0 not found.");
        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[1]))), "Neighbor 1 not found.");
        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[2]))), "Neighbor 2 not found.");
        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[3]))), "Neighbor 3 not found.");
        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[4]))), "Neighbor 4 not found.");
        assert.isTrue(neighbors.some(p => p.IsEqual(CellPosition.Add(cellPosition, CellPosition.neighborPositions[5]))), "Neighbor 5 not found.");
        done();
    });
});