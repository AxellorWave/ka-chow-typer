import click

from app.services.seed import run_seed


def register_cli(app):
    @app.cli.command("seed")
    def seed():
        for table, (inserted, updated) in run_seed().items():
            click.echo(f"{table}: добавлено {inserted}, обновлено {updated}")
