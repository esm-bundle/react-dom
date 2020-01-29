describe("esm-autopublish", () => {
  it("can load the ESM bundle", () => {
    return import("/base/esm/index.js");
  });

  it("can load the System.register bundle", () => {
    return import("/base/system/index.js");
  });
});
