import configparser
import os
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

stack_template_file = Path('./cli/stack.yaml.j2')
stack_file = Path('./cli/stack.yaml')
config_file = Path('./cli/stack.conf')

config_parser = configparser.ConfigParser()
config_parser.read(config_file)
config = {
    section: dict(config_parser.items(section))
    for section in config_parser.sections()
}

template_dir = os.path.dirname(str(stack_template_file))
template_name = os.path.basename(str(stack_template_file))

env = Environment(loader=FileSystemLoader(template_dir))
template = env.get_template(template_name)
output = template.render(config)

with open(stack_file, "w") as f:
    f.write(output)
