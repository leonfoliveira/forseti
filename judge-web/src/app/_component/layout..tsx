import React from "react";
import { useContainer } from "@/app/_atom/container-atom";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_component/form/button";

type Props = {
  signInPath: string;
  children: React.ReactNode;
};

export default function Layout({ signInPath, children }: Props) {
  const { authorizationService } = useContainer();
  const router = useRouter();

  const authorization = authorizationService.getAuthorization();

  function signOut() {
    authorizationService.deleteAuthorization();
    router.push(signInPath);
  }

  return (
    <div>
      <nav className="flex justify-end items-center bg-white p-2">
        <p className="mr-5">{authorization?.member.name}</p>
        <Button onClick={signOut} variant="outline-primary">
          Sign out
        </Button>
      </nav>
      <div className="bg-white m-10 p-10">{children}</div>
    </div>
  );
}
