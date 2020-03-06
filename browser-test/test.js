describe("@esm-bundle/react-dom", () => {
  it("can load the ESM bundle", () => {
    return import("/base/esm/react-dom.resolved.development.js");
  });

  it("can load the System.register development bundle", () => {
    return System.import("/base/system/react-dom.development.js").then(
      module => {
        console.log(module.unstable_batchedUpdates);
        expect(module.default).toBeDefined();
        expect(module.__esModule).toBeDefined();
        expect(typeof module.render).toBe("function");
        expect(typeof module.default.render).toBe("function");
        // some libs think that createPortal is a named export
        expect(module.createPortal).toBeDefined();
        expect(module.unstable_batchedUpdates).toBeDefined();
      }
    );
  });

  it("can load the System.register production bundle", () => {
    return System.import("/base/system/react-dom.production.min.js").then(
      module => {
        console.log(module.unstable_batchedUpdates);
        expect(module.default).toBeDefined();
        expect(module.__esModule).toBeDefined();
        expect(typeof module.render).toBe("function");
        expect(typeof module.default.render).toBe("function");
        // some libs think that createPortal is a named export
        expect(module.createPortal).toBeDefined();
        expect(module.unstable_batchedUpdates).toBeDefined();
      }
    );
  });
});
