import { FileUpload } from "./file-upload";

describe("FileUpload", () => {
  it("should create an instance", () => {
    const directive = new FileUpload();
    expect(directive).toBeTruthy();
  });
});
