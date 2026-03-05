import axios from "axios";

import { config } from "@/test/config";
import { Contest } from "@/test/entity/contest";
import { SubmissionLanguage } from "@/test/entity/submission";

type Session = {
  id: string;
  csrfToken: string;
};

export class ApiAdapter {
  private session: Session | null = null;

  async createContest(contest: Contest): Promise<string> {
    try {
      const session = await this.getSession();
      const response = await axios.post(
        `${config.API_URL}/v1/root/contests`,
        {
          slug: contest.slug,
          title: contest.title,
          startAt: contest.startAt,
          endAt: contest.endAt,
          languages: contest.languages.map((language) =>
            this.translateLanguage(language),
          ),
        },
        {
          headers: {
            Cookie: `session_id=${session.id};`,
            "x-csrf-token": session.csrfToken,
          },
        },
      );

      return response.data.id;
    } catch (error) {
      console.error("Error creating contest:", error);
      throw error;
    }
  }

  private translateLanguage(language: SubmissionLanguage): string {
    const valueToKey = Object.fromEntries(
      Object.entries(SubmissionLanguage).map(([key, value]) => [value, key]),
    );
    return valueToKey[language];
  }

  private async getSession(): Promise<Session> {
    if (!this.session) {
      return this.rootSignIn();
    }
    return this.session;
  }

  private async rootSignIn(): Promise<Session> {
    const response = await axios.post<Session>(
      `${config.API_URL}/v1/root:sign-in`,
      {
        password: config.ROOT_PASSWORD,
      },
    );

    this.session = response.data;
    return this.session;
  }
}
