// Pure-JS RFC4122 v4 UUID — no native modules required.
// These IDs are local SQLite row keys; Math.random() entropy is sufficient.
export function newId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
