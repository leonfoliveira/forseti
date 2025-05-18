"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useAtomValue } from "jotai";
import { containerAtom } from "@/app/_atom/container-atom";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect, useRouter } from "next/navigation";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { toAttachmentRequestDTO } from "@/app/_util/file-utils";
import { useToast } from "@/app/_util/toast-hook";
import Modal from "bootstrap/js/dist/modal";
import Link from "next/link";

type FormType = {
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: {
    type: MemberType;
    name: string;
    login: string;
    password: string;
  }[];
  problems: {
    title: string;
    description: string;
    timeLimit: number;
    testCases: FileList;
  }[];
};

function NewContestPage() {
  const { contestService } = useAtomValue(containerAtom);
  const router = useRouter();
  const toast = useToast();

  const createContestFetcher = useFetcher<ContestFullResponseDTO>();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: {
      members: [],
      problems: [],
    },
  });
  const membersFields = useFieldArray({
    control,
    name: "members",
  });
  const problemsFields = useFieldArray({
    control,
    name: "problems",
  });

  const [openDescription, setOpenDescription] = useState<number | null>(null);

  async function submit(data: FormType) {
    try {
      const requestDTO = {
        ...data,
        problems: await Promise.all(
          data.problems.map(async (problem) => ({
            ...problem,
            testCases: await toAttachmentRequestDTO(problem.testCases[0]),
          })),
        ),
      };
      const contest = await createContestFetcher.fetch(async () => {
        return await contestService.createContest(requestDTO);
      });
      toast.success("Contest created successfully");
      router.push(`/root/contests/${contest.id}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        redirect("/root/auth");
      } else {
        toast.error();
      }
    }
  }

  function formatLanguage(languages: Language) {
    switch (languages) {
      case Language.PYTHON_3_13_3:
        return "Python 3.13.3";
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
        <div className="d-flex align-items-center">
          <Link href="/root/contests" className="btn-close"></Link>
          <h2 className="m-0 ms-3">New Contest</h2>
        </div>
        <button
          className="btn btn-primary"
          disabled={createContestFetcher.isLoading}
        >
          Save
        </button>
      </div>
      <div className="mt-4">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            {...register("title", { required: "Title is required" })}
            disabled={createContestFetcher.isLoading}
          />
          <div className="form-text text-danger">{errors.title?.message}</div>
        </div>

        <div className="mb-3">
          <p className="mb-2">Languages</p>
          <div className="form-check">
            <Controller
              control={control}
              name="languages"
              defaultValue={[]}
              rules={{
                required: "At least one language is required",
                validate: (value) => {
                  if (value.length === 0) {
                    return "At least one language is required";
                  }
                },
              }}
              render={({ field }) => {
                const { value, onChange } = field;

                const handleCheckboxChange = (
                  checked: boolean,
                  option: string,
                ) => {
                  if (checked) {
                    onChange([...value, option]);
                  } else {
                    onChange(value.filter((v) => v !== option));
                  }
                };

                return (
                  <>
                    {Object.values(Language).map((language) => (
                      <div key={language}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={language}
                          checked={value.includes(language)}
                          onChange={(e) =>
                            handleCheckboxChange(e.target.checked, language)
                          }
                          disabled={createContestFetcher.isLoading}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkDefault"
                        >
                          {formatLanguage(language)}
                        </label>
                      </div>
                    ))}
                  </>
                );
              }}
            />
          </div>
          <div className="form-text text-danger">
            {errors.languages?.message}
          </div>
        </div>

        <div className="d-flex gap-3 mb-3">
          <div className="flex-grow-1">
            <label htmlFor="start-at" className="form-label">
              Start At
            </label>
            <input
              type="datetime-local"
              className="form-control"
              {...register("startAt", {
                required: "Start at is required",
                validate: (value) => {
                  const date = new Date(value);
                  const now = new Date();
                  if (date <= now) {
                    return "Start date must be in the future";
                  }
                },
              })}
              disabled={createContestFetcher.isLoading}
            />
            <div className="form-text text-danger">
              {errors.startAt?.message}
            </div>
          </div>
          <div className="flex-grow-1">
            <label htmlFor="end-at" className="form-label">
              End At
            </label>
            <input
              type="datetime-local"
              className="form-control"
              {...register("endAt", {
                required: "End at is required",
                validate: (value) => {
                  const endAt = new Date(value);
                  const startAt = new Date(watch("startAt"));
                  if (startAt >= endAt) {
                    return "End date must be after start date";
                  }
                },
              })}
              disabled={createContestFetcher.isLoading}
            />
            <div className="form-text text-danger">{errors.endAt?.message}</div>
          </div>
        </div>

        <div className="accordion mb-4">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseMembers"
              >
                Members ({watch("members").length})
              </button>
            </h2>
            <div
              id="collapseMembers"
              className="accordion-collapse collapse show"
            >
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Login</th>
                    <th scope="col">Password</th>
                    <th scope="col">Type</th>
                    <th scope="col" className="text-end pe-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {membersFields.fields.map((field, index) => (
                    <tr key={field.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          {...register(`members.${index}.name`, {
                            required: "Name is required",
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.members?.[index]?.name?.message}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-control"
                          {...register(`members.${index}.login`, {
                            required: "Login is required",
                            validate: (value) => {
                              const members = watch("members");
                              const equalLogins = members
                                .map((member) => member.login)
                                .filter((login) => login === value);
                              if (equalLogins.length > 1) {
                                return "Login must be unique";
                              }
                            },
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.members?.[index]?.login?.message}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-control"
                          {...register(`members.${index}.password`, {
                            required: "Password is required",
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.members?.[index]?.password?.message}
                        </div>
                      </td>

                      <td>
                        <select
                          id="member-type-1"
                          className="form-select"
                          {...register(`members.${index}.type`)}
                          disabled={createContestFetcher.isLoading}
                        >
                          {Object.values(MemberType)
                            .filter(
                              (memberType) => memberType != MemberType.ROOT,
                            )
                            .map((memberType) => (
                              <option key={memberType} value={memberType}>
                                {memberType}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => membersFields.remove(index)}
                          disabled={createContestFetcher.isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                className="btn btn-outline-primary ms-2 mb-2"
                onClick={() =>
                  membersFields.append({
                    type: MemberType.CONTESTANT,
                    name: "",
                    login: "",
                    password: "",
                  })
                }
                disabled={createContestFetcher.isLoading}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="accordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseProblems"
              >
                Problems ({watch("problems").length})
              </button>
            </h2>
            <div
              id="collapseProblems"
              className="accordion-collapse collapse show"
            >
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Time Limit (ms)</th>
                    <th scope="col">Test Cases (csv)</th>
                    <th scope="col" className="text-end pe-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {problemsFields.fields.map((field, index) => (
                    <tr key={field.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          {...register(`problems.${index}.title`, {
                            required: "Title is required",
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.problems?.[index]?.title?.message}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          {...register(`problems.${index}.description`, {
                            required: "Description is required",
                          })}
                          hidden
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100"
                          onClick={() => setOpenDescription(index)}
                          disabled={createContestFetcher.isLoading}
                        >
                          ...
                        </button>
                        <div className="form-text text-danger">
                          {errors.problems?.[index]?.description?.message}
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control"
                          {...register(`problems.${index}.timeLimit`, {
                            required: "Time limit is required",
                            validate: (value) => {
                              if (value <= 0) {
                                return "Time limit must be positive";
                              }
                            },
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.problems?.[index]?.timeLimit?.message}
                        </div>
                      </td>

                      <td>
                        <input
                          type="file"
                          className="form-control"
                          {...register(`problems.${index}.testCases`, {
                            required: "Test Cases are required",
                          })}
                          disabled={createContestFetcher.isLoading}
                        />
                        <div className="form-text text-danger">
                          {errors.problems?.[index]?.testCases?.message}
                        </div>
                      </td>

                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => problemsFields.remove(index)}
                          disabled={createContestFetcher.isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                className="btn btn-outline-primary ms-2 mb-2"
                onClick={() =>
                  problemsFields.append({
                    title: "",
                    description: "",
                    timeLimit: 0,
                    testCases: null as unknown as FileList,
                  })
                }
                disabled={createContestFetcher.isLoading}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {openDescription !== null && (
        <div
          className="modal vh-100 vw-100"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            overflow: "auto",
            zIndex: 10,
          }}
        >
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Description</h5>\
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOpenDescription(null)}
                />
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control h-100"
                  style={{ resize: "none" }}
                  {...register(`problems.${openDescription}.description`)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setOpenDescription(null)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default NewContestPage;
