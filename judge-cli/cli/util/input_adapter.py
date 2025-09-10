import questionary


class InputAdapter:
    def password(self, prompt: str, **kwargs) -> str:
        value = questionary.password(prompt, **kwargs).ask()
        if value is None:
            raise KeyboardInterrupt()
        return value
