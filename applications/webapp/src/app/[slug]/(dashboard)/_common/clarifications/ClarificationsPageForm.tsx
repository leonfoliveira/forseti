import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  ClarificationForm,
  ClarificationFormType,
} from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { Composition } from "@/config/composition";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

type Props = {
  contestId: string;
  onClose: () => void;
  onCreate: (clarification: ClarificationResponseDTO) => void;
  problems: ProblemResponseDTO[];
};

export function ClarificationsPageForm({
  contestId,
  onClose,
  onCreate,
  problems,
}: Props) {
  const toast = useToast();
  const createClarificationState = useLoadableState();

  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(ClarificationForm.schema),
    defaultValues: ClarificationForm.getDefault(),
  });

  async function createClarification(data: ClarificationFormType) {
    console.debug("Creating clarification with data:", data);
    createClarificationState.start();

    try {
      const newClarification = await Composition.clarificationWritter.create(
        contestId,
        ClarificationForm.toInputDTO(data),
      );

      toast.success("Clarification created successfully");
      onCreate(newClarification);
      console.debug("Clarification created successfully:", newClarification);
      createClarificationState.finish();
      form.reset();

      onClose();
    } catch (error) {
      await createClarificationState.fail(error, {
        default: () => toast.error("Failed to create clarification"),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="clarification-form">
      <CardHeader>
        <CardTitle>Create Clarification</CardTitle>
        <CardDescription>
          Submit a new clarification request for a contest problem or a general
          question.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form onSubmit={form.handleSubmit(createClarification)}>
          <FieldSet disabled={createClarificationState.isLoading}>
            <ControlledField
              form={form}
              name="problemId"
              label="Problem"
              field={
                <NativeSelect data-testid="clarification-form-problem">
                  <NativeSelectOption value="__none__">
                    None (General question)
                  </NativeSelectOption>
                  {problems.map((problem) => (
                    <NativeSelectOption key={problem.id} value={problem.id}>
                      {`${problem.letter}. ${problem.title}`}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <ControlledField
              form={form}
              name="text"
              label="Text"
              field={<Textarea data-testid="clarification-form-text" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="clarification-form-cancel"
              >
                Cancel
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createClarificationState.isLoading}
                data-testid="clarification-form-submit"
              >
                Submit
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
