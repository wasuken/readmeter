import { ReadingStatusPolicy } from "./ReadingStatusPolicy";
import { ReadingStatus } from "../valueobject/ReadingStatus";

test("ReadingStatusPolicy.canTransitionの組み合わせチェック", () => {
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Unread,
      ReadingStatus.Reading,
    ),
  ).toBe(true);
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Unread,
      ReadingStatus.Completed,
    ),
  ).toBe(false);
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Reading,
      ReadingStatus.Completed,
    ),
  ).toBe(true);
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Reading,
      ReadingStatus.Unread,
    ),
  ).toBe(false);
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Completed,
      ReadingStatus.Reading,
    ),
  ).toBe(true);
  expect(
    ReadingStatusPolicy.canTransition(
      ReadingStatus.Completed,
      ReadingStatus.Unread,
    ),
  ).toBe(false);
});
