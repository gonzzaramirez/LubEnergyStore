import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { negotiateMarkdown, parseAccept } from "../lib/accept.ts";

describe("parseAccept", () => {
  it("returns empty for missing or blank headers", () => {
    assert.deepEqual(parseAccept(null), []);
    assert.deepEqual(parseAccept(undefined), []);
    assert.deepEqual(parseAccept("   "), []);
  });

  it("parses media ranges with q-values", () => {
    const parts = parseAccept("text/html;q=0.8, text/markdown;q=1.0");
    assert.equal(parts.length, 2);
    assert.deepEqual(parts[0], {
      type: "text",
      subtype: "html",
      quality: 0.8,
      order: 0,
    });
    assert.equal(parts[1].subtype, "markdown");
    assert.equal(parts[1].quality, 1);
  });

  it("clamps q-values to [0, 1] and ignores malformed ones", () => {
    const parts = parseAccept("text/markdown;q=7, text/html;q=abc");
    assert.equal(parts[0].quality, 1);
    assert.equal(parts[1].quality, 1);
  });
});

describe("negotiateMarkdown", () => {
  it("defaults to html without an Accept header", () => {
    assert.equal(negotiateMarkdown(null), "html");
    assert.equal(negotiateMarkdown(undefined), "html");
    assert.equal(negotiateMarkdown(""), "html");
  });

  it("serves markdown when explicitly requested", () => {
    assert.equal(negotiateMarkdown("text/markdown"), "markdown");
    assert.equal(negotiateMarkdown('text/markdown;q=0.9'), "markdown");
    assert.equal(
      negotiateMarkdown("text/markdown, application/json;q=0.5"),
      "markdown",
    );
  });

  it("honors q-values between markdown and html", () => {
    assert.equal(
      negotiateMarkdown("text/html;q=0.5, text/markdown;q=0.9"),
      "markdown",
    );
    assert.equal(
      negotiateMarkdown("text/markdown;q=0.4, text/html;q=0.8"),
      "html",
    );
  });

  it("breaks exact ties by header position (client preference)", () => {
    assert.equal(
      negotiateMarkdown("text/markdown;q=0.9, text/html;q=0.9"),
      "markdown",
    );
    assert.equal(
      negotiateMarkdown("text/html;q=0.9, text/markdown;q=0.9"),
      "html",
    );
  });

  it("resolves wildcard-only accepts to the default html representation", () => {
    assert.equal(negotiateMarkdown("*/*"), "html");
    assert.equal(negotiateMarkdown("text/*"), "html");
    assert.equal(negotiateMarkdown("*/*;q=0.1"), "html");
  });

  it("lets an explicit markdown beat a wildcard html default", () => {
    // */* matches everything at q=0.2 but text/markdown is explicit at q=0.3
    assert.equal(negotiateMarkdown("*/*;q=0.2, text/markdown;q=0.3"), "markdown");
    // wildcard wins on quality: server picks its default (html)
    assert.equal(negotiateMarkdown("*/*;q=0.5, text/markdown;q=0.3"), "html");
  });

  it("answers not-acceptable when the client excludes both offers", () => {
    assert.equal(negotiateMarkdown("application/json"), "not-acceptable");
    assert.equal(negotiateMarkdown("application/json, text/plain"), "not-acceptable");
    assert.equal(negotiateMarkdown("text/markdown;q=0"), "not-acceptable");
    assert.equal(
      negotiateMarkdown("text/markdown;q=0, text/html;q=0"),
      "not-acceptable",
    );
  });

  it("never negotiates for RSC-like garbage input", () => {
    assert.equal(negotiateMarkdown(", ,,"), "html");
    assert.equal(negotiateMarkdown("///"), "html");
  });
});
