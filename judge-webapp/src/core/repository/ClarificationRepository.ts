export interface ClarificationRepository {
  deleteById(id: string): Promise<void>;
}
