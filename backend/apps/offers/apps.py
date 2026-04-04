from django.apps import AppConfig


class OffersConfig(AppConfig):
    name = 'apps.offers'

    def ready(self):
        import apps.offers.signals  # noqa: F401
