describe(`@esm-bundle/react-dom-server`, () => {
  it("can load the esm bundle without dying", () => {
    return import("../esm/react-dom-server.browser.development.js");
  });

  it(`has a renderToString method on development bundle`, async () => {
    const ReactDomServer = await import(
      "../esm/react-dom-server.browser.development.js"
    );
    expect(ReactDomServer.renderToString).not.to.equal(undefined);
    expect(typeof ReactDomServer.renderToString).to.equal("function");
    expect(ReactDomServer.default.renderToString).not.to.equal(undefined);
    expect(typeof ReactDomServer.default.renderToString).to.equal("function");
  });

  it(`has a renderToString method on the production bundle`, async () => {
    const ReactDomServer = await import(
      "../esm/react-dom-server.browser.production.min.js"
    );
    expect(ReactDomServer.renderToString).not.to.equal(undefined);
    expect(typeof ReactDomServer.renderToString).to.equal("function");
    expect(ReactDomServer.default.renderToString).not.to.equal(undefined);
    expect(typeof ReactDomServer.default.renderToString).to.equal("function");
  });
});
