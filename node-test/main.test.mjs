describe("@esm-bundle/autopublish-template", () => {
  it("can load the esm bundle without dying", () => {
    return import("../esm/react-dom.development.js");
  });

  // it(`has a render() function on it`, async () => {
  //   const ReactDOM = await import('../esm/react-dom.development.js')
  //   expect(ReactDOM.render).not.to.be(undefined);
  // })
});
