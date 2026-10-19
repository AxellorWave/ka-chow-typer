import click


def register_cli(app):
    @app.cli.command("seed")
    def seed():
        click.echo("Seeds are not implemented yet")
