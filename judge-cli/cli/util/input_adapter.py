import questionary


class InputAdapter:
    def text(self, prompt: str, **kwargs) -> str:
        value = questionary.text(prompt, **kwargs).ask()
        if value is None:
            raise KeyboardInterrupt()
        return value

    def password(self, prompt: str, **kwargs) -> str:
        value = questionary.password(prompt, **kwargs).ask()
        if value is None:
            raise KeyboardInterrupt()
        return value

    def checkbox(self, prompt: str, choices: list[questionary.Choice], **kwargs) -> list[str]:
        value = questionary.checkbox(prompt, choices=choices, **kwargs).ask()
        if value is None:
            raise KeyboardInterrupt()
        return value
