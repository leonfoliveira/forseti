import click
import threading


class Spinner:
    CHARS = "|/-\\"

    def __init__(self, label: str = "Processing..."):
        self.label = label
        self.idx = 0
        self.running = False
        self.thread = None

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._spin)
        self.thread.start()

    def complete(self):
        self.running = False
        if self.thread:
            self.thread.join()
            self.thread = None
            click.echo(f"\r✓ {self.label}")

    def fail(self):
        self.running = False
        if self.thread:
            self.thread.join()
            self.thread = None
            click.echo(f"\r✗ {self.label}")

    def _spin(self):
        while self.running:
            click.echo(
                f"\r{self.CHARS[self.idx % len(self.CHARS)]} {self.label}", nl=False)
            self.idx += 1
            threading.Event().wait(0.1)
