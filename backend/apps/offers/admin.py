from django.contrib import admin
from .models import Domain, Location, OfferType, DurationOption, Skill, Offer, Application, Challenge, ChallengeSubmission, FavoriteOffer

admin.site.register(Domain)
admin.site.register(Location)
admin.site.register(OfferType)
admin.site.register(DurationOption)
admin.site.register(Skill)
admin.site.register(Offer)
admin.site.register(Application)
admin.site.register(Challenge)
admin.site.register(ChallengeSubmission)
admin.site.register(FavoriteOffer)
