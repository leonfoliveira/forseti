export interface SessionWriter {
  /**
   * Delete the current session.
   */
  deleteCurrent(): Promise<void>;
}
