import questionary


class InputAdapter:
    def password(self, prompt: str, **kwargs) -> str:
        value = questionary.password(prompt, **kwargs).ask()
        if value is None:
            raise KeyboardInterrupt()
        return value

    @staticmethod
    def length_validator(min_length: int):
        def validate_length(value: str) -> bool | str:
            if len(value) < min_length:
                return f"Must be at least {min_length} characters long"
            return True
        return validate_length
