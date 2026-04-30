from .models import OfferEvent

def log_offer_event(offer, event_type, description, metadata=None):
    """
    Utility to record a milestone in the offer's timeline.
    """
    if metadata is None:
        metadata = {}
        
    # Check for duplicate 'first_view' or 'first_app' to keep timeline clean
    if event_type in ['first_view', 'first_app']:
        if OfferEvent.objects.filter(offer=offer, event_type=event_type).exists():
            return None
            
    return OfferEvent.objects.create(
        offer=offer,
        event_type=event_type,
        description=description,
        metadata=metadata
    )
