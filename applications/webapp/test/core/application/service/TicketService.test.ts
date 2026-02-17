import { mock } from "jest-mock-extended";

import { TicketService } from "@/core/application/service/TicketService";
import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketRepository } from "@/core/port/driven/repository/TicketRepository";
import { MockCreateTicketRequestDTO } from "@/test/mock/request/MockCreateTicketRequestDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

describe("TicketService", () => {
  const ticketRepository = mock<TicketRepository>();

  const sut = new TicketService(ticketRepository);

  describe("create", () => {
    it("should create a ticket", async () => {
      const contestId = "contest-id";
      const inputDTO = MockCreateTicketRequestDTO();
      const expectedResponse = MockTicketResponseDTO();
      ticketRepository.create.mockResolvedValue(expectedResponse);

      const result = await sut.create(contestId, inputDTO);

      expect(result).toEqual(expectedResponse);
      expect(ticketRepository.create).toHaveBeenCalledWith(contestId, inputDTO);
    });
  });

  describe("updateStatus", () => {
    it("should update the status of a ticket", async () => {
      const contestId = "contest-id";
      const ticketId = "ticket-id";
      const status = TicketStatus.RESOLVED;
      const expectedResponse = MockTicketResponseDTO();
      ticketRepository.updateStatus.mockResolvedValue(expectedResponse);

      const result = await sut.updateStatus(contestId, ticketId, status);

      expect(result).toEqual(expectedResponse);
      expect(ticketRepository.updateStatus).toHaveBeenCalledWith(
        contestId,
        ticketId,
        status,
      );
    });
  });

  describe("findAllByContestId", () => {
    it("should find all tickets by contest id", async () => {
      const contestId = "contest-id";
      const expectedResponse = [MockTicketResponseDTO()];
      ticketRepository.findAllByContestId.mockResolvedValue(expectedResponse);

      const result = await sut.findAllByContestId(contestId);

      expect(result).toEqual(expectedResponse);
      expect(ticketRepository.findAllByContestId).toHaveBeenCalledWith(
        contestId,
      );
    });
  });

  describe("findAllBySignedInMember", () => {
    it("should find all tickets by signed in member", async () => {
      const contestId = "contest-id";
      const expectedResponse = [MockTicketResponseDTO()];
      ticketRepository.findAllBySignedInMember.mockResolvedValue(
        expectedResponse,
      );

      const result = await sut.findAllBySignedInMember(contestId);

      expect(result).toEqual(expectedResponse);
      expect(ticketRepository.findAllBySignedInMember).toHaveBeenCalledWith(
        contestId,
      );
    });
  });
});
