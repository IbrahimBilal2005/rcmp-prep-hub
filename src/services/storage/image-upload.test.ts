import { expect, it } from "vitest";
import { withUploadTimeout } from "./image-upload";

it("accepts the PromiseLike query builders returned by Supabase", async () => {
  const operation: PromiseLike<{ data: { id: number }; error: null }> = {
    then: (resolve, reject) => Promise.resolve({ data: { id: 1 }, error: null }).then(resolve, reject),
  };
  await expect(withUploadTimeout(operation)).resolves.toEqual({ data: { id: 1 }, error: null });
});
