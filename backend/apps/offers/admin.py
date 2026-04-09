from django.contrib import admin
from .models import Location, OfferType, DurationOption, Offer, Application, FavoriteOffer

admin.site.register(Location)
admin.site.register(OfferType)
admin.site.register(DurationOption)
admin.site.register(Offer)
admin.site.register(Application)
admin.site.register(FavoriteOffer)
