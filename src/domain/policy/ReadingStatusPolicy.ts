import { ReadingStatus } from "../valueobject/ReadingStatus";

export class ReadingStatusPolicy {
  static canTransition(from: ReadingStatus, to: ReadingStatus): boolean {
    const rules: Record<ReadingStatus, ReadingStatus[]> = {
      [ReadingStatus.Unread]: [ReadingStatus.Reading],
      [ReadingStatus.Reading]: [ReadingStatus.Completed],
      [ReadingStatus.Completed]: [ReadingStatus.Reading],
    };
    return rules[from].includes(to);
  }
}
