from apps.admin_panel.models import AdminActionLog

def log_admin_action(request, action_type, obj, metadata=None):
    if metadata is None:
        metadata = {}
        
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    AdminActionLog.objects.create(
        admin=request.user,
        action_type=action_type,
        target_model=obj._meta.model_name,
        target_id=str(obj.pk),
        ip_address=ip,
        metadata=metadata
    )
