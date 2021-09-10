import "reflect-metadata";
import { assert } from "chai";

describe("Example test", () =>
{
    it("should not fail", (done) =>
    {
        assert.isTrue(true, "error");
        done();
    });
});