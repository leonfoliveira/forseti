import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useForm } from "react-hook-form";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import {
  FormType,
  RootSignInForm,
} from "@/app/root/_component/root-sign-in-form";

export default function RootSignInPage() {
  const { authenticationService } = useContainer();
  const toast = useToast();
  const authenticateRootFetcher = useFetcher();
  const router = useRouter();
  const form = useForm<FormType>();

  async function signIn(form: FormType) {
    try {
      await authenticateRootFetcher.fetch(() =>
        authenticationService.authenticateRoot(form),
      );
      toast.success("Sign in successful");
      router.push("/root");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        toast.warning("Invalid password");
      }
      throw error;
    }
  }

  return (
    <RootSignInForm
      onSubmit={signIn}
      form={form}
      isDisabled={authenticateRootFetcher.isLoading}
    />
  );
}
