import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { authenticationService } from "@/config/composition";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { globalMessages } from "@/i18n/global";
import { CountdownClock } from "@/lib/component/countdown-clock";
import { useTheme } from "@/lib/util/theme-hook";
import {
  authorizationSlice,
  useAuthorization,
} from "@/store/slices/authorization-slice";
import { useAppDispatch } from "@/store/store";

const messages = defineMessages({
  rootTitle: {
    id: "app._component.navbar.root-title",
    defaultMessage: "Judge - Root",
  },
  guestName: {
    id: "app._component.navbar.guest-name",
    defaultMessage: "Guest",
  },
  signIn: {
    id: "app._component.navbar.sign-in",
    defaultMessage: "Sign In",
  },
  signOut: {
    id: "app._component.navbar.sign-out",
    defaultMessage: "Sign Out",
  },
});

type Props = {
  contestMetadata?: ContestMetadataResponseDTO;
  signInPath: string;
};

export function Navbar({ contestMetadata, signInPath }: Props) {
  const { theme, toggleTheme } = useTheme();
  const authorization = useAuthorization();
  const dispatch = useAppDispatch();

  async function signOut() {
    dispatch(authorizationSlice.actions.reset());
    try {
      await authenticationService.cleanAuthorization();
    } catch (error) {
      console.error(error);
    } finally {
      window.location.href = signInPath;
    }
  }

  const isGuest = !authorization?.member;

  return (
    <nav className="navbar bg-base-100">
      <div className="grid [grid-template-columns:1fr_auto_1fr] items-center w-full">
        <div className="text-lg font-semibold ml-2" data-testid="title">
          {contestMetadata ? (
            contestMetadata.title
          ) : (
            <FormattedMessage {...messages.rootTitle} />
          )}
        </div>
        <div className="text-center">
          {contestMetadata && (
            <CountdownClock
              className="font-mono text-sm"
              to={new Date(contestMetadata.endAt)}
            />
          )}
        </div>
        <div className="flex items-center w-full justify-end">
          <label className="toggle text-base-content" htmlFor="theme">
            <input
              id="theme"
              aria-label="theme"
              type="checkbox"
              className="theme-controller"
              checked={theme === "dark"}
              onChange={toggleTheme}
              data-testid="theme"
            />
            <FontAwesomeIcon icon={faSun} size="xs" />
            <FontAwesomeIcon icon={faMoon} size="xs" />
          </label>
          <ul className="menu menu-horizontal">
            <li>
              <details>
                <summary className="font-semibold" data-testid="member">
                  {isGuest ? (
                    <FormattedMessage {...messages.guestName} />
                  ) : (
                    authorization?.member.name
                  )}
                </summary>
                <ul
                  className="bg-base-100 rounded-t-none right-0 !mt-0"
                  data-testid="menu"
                >
                  {!isGuest && (
                    <li className="menu-title">
                      <FormattedMessage
                        {...globalMessages.memberType[
                          authorization?.member.type
                        ]}
                      />
                    </li>
                  )}
                  <li>
                    <a
                      onClick={signOut}
                      className="text-nowrap"
                      data-testid="sign"
                    >
                      {isGuest ? (
                        <FormattedMessage {...messages.signIn} />
                      ) : (
                        <FormattedMessage {...messages.signOut} />
                      )}
                    </a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
