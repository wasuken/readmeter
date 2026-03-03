import { ReadingStatus } from "./ReadingStatus";

test("ReadingStatusの値が正しい", () => {
  expect(ReadingStatus.Unread).toBe("Unread");
  expect(ReadingStatus.Reading).toBe("Reading");
  expect(ReadingStatus.Completed).toBe("Completed");
});
