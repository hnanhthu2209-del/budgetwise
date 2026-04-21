// MVP ships without a backend; this adapter is the default until cloud sync
// is wired up in M2.
import { SyncAdapter, SyncBatch } from './SyncAdapter';

export class NoopSyncAdapter implements SyncAdapter {
  async push(_batch: SyncBatch): Promise<void> {
    /* no-op */
  }
  async pull(_since: Date | null): Promise<SyncBatch> {
    return {};
  }
  async lastSyncedAt(): Promise<Date | null> {
    return null;
  }
}
