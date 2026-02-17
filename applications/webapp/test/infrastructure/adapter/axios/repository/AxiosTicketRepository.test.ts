import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosTicketRepository } from "@/infrastructure/adapter/axios/repository/AxiosTicketRepository";

describe("AxiosTicketRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosTicketRepository(axiosClient);

  const contestId = uuidv4();

  describe("createTicket", () => {
    it("should create a ticket and return the response", async () => {
      const request = {
        type: TicketType.TECHNICAL_SUPPORT,
        description: "Help!",
      } as any;
      const expectedResponse = {
        id: uuidv4(),
        type: TicketType.TECHNICAL_SUPPORT,
        status: TicketStatus.OPEN,
        properties: {
          description: "Help!",
        },
      };
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.create(contestId, request);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/tickets`,
        {
          data: request,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("updateTicketStatus", () => {
    it("should update the ticket status and return the response", async () => {
      const ticketId = uuidv4();
      const newStatus = TicketStatus.IN_PROGRESS;
      const expectedResponse = {
        id: ticketId,
        type: TicketType.TECHNICAL_SUPPORT,
        status: newStatus,
        properties: {
          description: "Help!",
        },
      };
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.updateStatus(contestId, ticketId, newStatus);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/tickets/${ticketId}/status`,
        {
          data: {
            status: newStatus,
          },
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllByContestId", () => {
    it("should return an array of tickets for the contest", async () => {
      const expectedResponse = [
        {
          id: uuidv4(),
          type: TicketType.TECHNICAL_SUPPORT,
          status: TicketStatus.OPEN,
          properties: {
            description: "Help!",
          },
        },
        {
          id: uuidv4(),
          type: TicketType.NON_TECHNICAL_SUPPORT,
          status: TicketStatus.IN_PROGRESS,
          properties: {
            description: "I need a bathroom break",
          },
        },
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllByContestId(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/tickets`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllBySignedInMember", () => {
    it("should return an array of tickets for the signed-in member in the contest", async () => {
      const expectedResponse = [
        {
          id: uuidv4(),
          type: TicketType.TECHNICAL_SUPPORT,
          status: TicketStatus.OPEN,
          properties: {
            description: "Help!",
          },
        },
        {
          id: uuidv4(),
          type: TicketType.NON_TECHNICAL_SUPPORT,
          status: TicketStatus.IN_PROGRESS,
          properties: {
            description: "I need a bathroom break",
          },
        },
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllBySignedInMember(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/tickets/members/me`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
