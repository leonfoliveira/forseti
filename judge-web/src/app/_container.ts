import { atom } from "jotai/vanilla/atom";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { LocalStorageAuthorizationRepository } from "@/adapter/localstorage/LocalStorageAuthorizationRepository";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosProblemRepository } from "@/adapter/axios/AxiosProblemRepository";
import { ContestService } from "@/core/service/ContestService";
import { ProblemService } from "@/core/service/ProblemService";

export const container = atom(() => {
  const authorizationRepository = new LocalStorageAuthorizationRepository();
  const authorizationService = new AuthorizationService(
    authorizationRepository,
  );

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const axiosClient = new AxiosClient(baseUrl, authorizationService);

  const authenticationRepository = new AxiosAuthenticationRepository(
    axiosClient,
  );
  const contestRepository = new AxiosContestRepository(axiosClient);
  const problemRepository = new AxiosProblemRepository(axiosClient);

  const authenticationService = new AuthenticationService(
    authenticationRepository,
    authorizationRepository,
  );
  const contestService = new ContestService(contestRepository);
  const problemService = new ProblemService(problemRepository);

  return {
    authenticationService,
    authorizationService,
    contestService,
    problemService,
  };
});
