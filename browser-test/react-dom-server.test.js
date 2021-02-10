describe("@esm-bundle/react-dom-server", () => {
  it("can load the development ESM bundle", () => {
    return import("/base/esm/react-dom-server.resolved.browser.development.js");
  });

  it("can load the production ESM bundle", () => {
    return import(
      "/base/esm/react-dom-server.resolved.browser.production.min.js"
    );
  });

  it(`can load the systemJS development bundle`, () => {
    return System.import(
      "/base/system/react-dom-server.browser.development.js"
    ).then((module) => {
      expect(module.default).toBeDefined();
      expect(module.__esModule).toBeDefined();
      expect(typeof module.renderToString).toBe("function");
      expect(typeof module.default.renderToString).toBe("function");
    });
  });

  it(`can load the systemJS production bundle`, () => {
    return System.import(
      "/base/system/react-dom-server.browser.production.min.js"
    ).then((module) => {
      expect(module.default).toBeDefined();
      expect(module.__esModule).toBeDefined();
      expect(typeof module.renderToString).toBe("function");
      expect(typeof module.default.renderToString).toBe("function");
    });
  });
});
