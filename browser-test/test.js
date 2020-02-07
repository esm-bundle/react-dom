describe("@esm-bundle/react-dom", () => {
  it("can load the ESM bundle", () => {
    return import("/base/esm/react-dom.resolved.development.js");
  });

  it("can load the System.register bundle", () => {
    return System.import("/base/system/react-dom.development.js").then(
      module => {
        expect(module.default).toBeDefined();
        expect(module.__esModule).toBeDefined();
      }
    );
  });
});
