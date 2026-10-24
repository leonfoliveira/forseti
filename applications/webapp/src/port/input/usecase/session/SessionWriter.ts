export interface SessionWritter {
  /**
   * Delete the current session.
   */
  deleteCurrent(): Promise<void>;
}
