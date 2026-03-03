export const ReadingStatus = {
  Unread: "Unread", // 積読
  Reading: "Reading", // 読中
  Completed: "Completed", // 読了
} as const;

export type ReadingStatus = (typeof ReadingStatus)[keyof typeof ReadingStatus];
