import { z } from "zod";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Language } from "@/core/domain/enumerate/Language";

export const contestFormValidation = z
  .object({
    id: z.number().optional(),
    title: z.string({}).nonempty("Title is required"),
    languages: z
      .array(z.nativeEnum(Language))
      .nonempty("At least one language is required"),
    startAt: z
      .date({ required_error: "Start at is required" })
      .min(new Date(), "Start at must be in the future"),
    endAt: z.date({ required_error: "End at is required" }),
    members: z.array(
      z
        .object({
          _id: z.number().optional(),
          type: z.nativeEnum(MemberType, {
            required_error: "Type is required",
          }),
          name: z.string().nonempty("Name is required"),
          login: z.string().nonempty("Login is required"),
          password: z.string().optional(),
        })
        .refine(
          (data) => {
            console.log("data-1", data);
            return !!data._id || !!data.password?.trim();
          },
          {
            message: "Password is required",
            path: ["password"],
          },
        ),
    ),
    problems: z.array(
      z
        .object({
          _id: z.number().optional(),
          title: z.string().nonempty("Title is required"),
          timeLimit: z
            .number({ required_error: "Time limit is required" })
            .min(1, "Time limit must be greater than 0"),
          testCasesAttachment: z.any().optional(),
          testCases: z.any().optional(),
        })
        .refine(
          (data) => {
            console.log("data-2", data);
            return !!data.testCasesAttachment || !!data.testCases;
          },
          {
            message: "Test cases is required",
            path: ["testCases"],
          },
        ),
    ),
  })
  .refine(
    (data) => {
      return data.endAt > data.startAt;
    },
    {
      message: "End at must be after start at",
      path: ["endAt"],
    },
  );
