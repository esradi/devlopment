from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

class NotificationService:
    @staticmethod
    def _broadcast_to_user(user_id, message_type, payload):
        """
        Internal helper to broadcast a message to a user's notification group.
        """
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"notifications_{user_id}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": message_type,
                    **payload
                }
            )

    @staticmethod
    def create_and_send_notification(user, notif_type, title, message, **kwargs):
        """
        Creates a Notification in DB and broadcasts it via WebSockets.
        """
        # Create in DB
        notification = Notification.objects.create(
            user=user,
            type=notif_type,
            title=title,
            message=message,
            action_url=kwargs.get('action_url'),
            action_text=kwargs.get('action_text'),
            priority=kwargs.get('priority', 'normal'),
            related_object_type=kwargs.get('related_object_type'),
            related_object_id=kwargs.get('related_object_id')
        )
        
        # Format payload for WebSocket
        notification_data = {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "action_url": notification.action_url,
            "action_text": notification.action_text,
            "priority": notification.priority,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
            "related_object_type": notification.related_object_type,
            "related_object_id": notification.related_object_id,
        }
        
        # Send to user's WebSocket group
        NotificationService._broadcast_to_user(user.id, "notification_message", {"notification": notification_data})
        
        return notification

    @staticmethod
    def broadcast_notification_read(user_id, notification_id):
        """Broadcast that a specific notification was marked as read."""
        NotificationService._broadcast_to_user(user_id, "notification_read", {"notification_id": notification_id})

    @staticmethod
    def broadcast_all_read(user_id):
        """Broadcast that all notifications were marked as read."""
        NotificationService._broadcast_to_user(user_id, "all_notifications_read", {})

    @staticmethod
    def broadcast_notifications_cleared(user_id):
        """Broadcast that notifications were cleared."""
        NotificationService._broadcast_to_user(user_id, "notifications_cleared", {})

    # --- Helpers: Applications ---

    @staticmethod
    def notify_application_submitted(application):
        company_user = application.offer.company.user
        student_name = f"{application.student.first_name} {application.student.last_name}"
        return NotificationService.create_and_send_notification(
            user=company_user,
            notif_type="application_submitted",
            title="New Application Received",
            message=f"{student_name} has applied for '{application.offer.title}'.",
            action_url=f"/company/applications/{application.id}",
            related_object_type="application",
            related_object_id=application.id
        )

    @staticmethod
    def notify_application_accepted(application):
        student_user = application.student.user
        comp_name = application.offer.company.company_name
        return NotificationService.create_and_send_notification(
            user=student_user,
            notif_type="application_accepted",
            title="Application Accepted!",
            message=f"Congratulations, your application for '{application.offer.title}' at {comp_name} was accepted.",
            action_url=f"/student/applications/{application.id}",
            priority="high",
            related_object_type="application",
            related_object_id=application.id
        )

    # --- Helpers: Conventions ---

    @staticmethod
    def notify_convention_generated(convention):
        # Notify the student that a convention is ready
        student_user = convention.student.user
        return NotificationService.create_and_send_notification(
            user=student_user,
            notif_type="convention_generated",
            title="Convention Ready to Sign",
            message=f"The convention for '{convention.offer.title}' has been generated. Please review and sign it using your fingerprint.",
            action_url=f"/student/conventions/{convention.id}",
            priority="high",
            related_object_type="convention",
            related_object_id=convention.id
        )

    @staticmethod
    def notify_convention_student_signed(convention):
        # Notify company that student signed
        company_user = convention.company.user
        student_name = f"{convention.student.first_name} {convention.student.last_name}"
        return NotificationService.create_and_send_notification(
            user=company_user,
            notif_type="convention_student_signed",
            title="Student Signed Convention",
            message=f"{student_name} has securely signed the convention. It is now your turn.",
            action_url=f"/company/conventions/{convention.id}",
            priority="high",
            related_object_type="convention",
            related_object_id=convention.id
        )

    @staticmethod
    def notify_convention_company_signed(convention):
        # Notify university admin that company signed and it's ready for validation
        # Here we broadcast to all admins as a shortcut, or just specific admin if known
        from apps.accounts.models import User
        admins = User.objects.filter(role='admin')
        for admin in admins:
            NotificationService.create_and_send_notification(
                user=admin,
                notif_type="convention_company_signed",
                title="Convention Pending Validation",
                message=f"The convention for {convention.student} at {convention.company} is fully signed and awaits your validation.",
                action_url=f"/admin/conventions/{convention.id}",
                priority="high",
                related_object_type="convention",
                related_object_id=convention.id
            )
            
        #student know the company signed
        return NotificationService.create_and_send_notification(
            user=convention.student.user,
            notif_type="convention_company_signed",
            title="Company Signed Convention",
            message=f"The company has signed your convention. It is now awaiting University Administration validation.",
            action_url=f"/student/conventions/{convention.id}",
            related_object_type="convention",
            related_object_id=convention.id
        )

    @staticmethod
    def notify_convention_validated(convention):
        # Notify both student and company that it is fully approved
        NotificationService.create_and_send_notification(
            user=convention.student.user,
            notif_type="convention_validated",
            title="Convention Officially Validated!",
            message=f"Your convention for '{convention.offer.title}' has been validated by the university. You can download the final PDF.",
            action_url=f"/student/conventions/{convention.id}",
            priority="urgent",
            related_object_type="convention",
            related_object_id=convention.id
        )
        NotificationService.create_and_send_notification(
            user=convention.company.user,
            notif_type="convention_validated",
            title="Convention Officially Validated",
            message=f"The convention for '{convention.student}' has been validated by the university.",
            action_url=f"/company/conventions/{convention.id}",
            priority="urgent",
            related_object_type="convention",
            related_object_id=convention.id
        )
        return True

    @staticmethod
    def notify_application_viewed(application):
        """Notifier l'étudiant que sa candidature a été vue"""
        NotificationService.create_and_send_notification(
            user=application.student.user,
            notif_type='application_viewed',
            title='👀 Candidature consultée',
            message=f"{application.offer.company.company_name} a consulté votre candidature pour '{application.offer.title}'",
            action_url=f'/student/applications/{application.id}',
            priority='normal',
            related_object_type='application',
            related_object_id=application.id
        )
    
    @staticmethod
    def notify_application_refused(application):
        """Notifier l'étudiant du refus"""
        NotificationService.create_and_send_notification(
            user=application.student.user,
            notif_type='application_refused',
            title='Candidature non retenue',
            message=f"Votre candidature pour '{application.offer.title}' n'a pas été retenue.",
            action_url=f'/student/applications/{application.id}',
            priority='normal',
            related_object_type='application',
            related_object_id=application.id
        )
    
    @staticmethod
    def notify_skill_verified(student, skill_name):
        """Notifier l'étudiant qu'une compétence est vérifiée"""
        NotificationService.create_and_send_notification(
            user=student.user,
            notif_type='skill_verified',
            title='✅ Compétence vérifiée!',
            message=f'Félicitations! Votre compétence "{skill_name}" a été vérifiée avec succès.',
            action_url='/student/profile/skills',
            priority='high',
            related_object_type='skill'
        )
    
    @staticmethod
    def notify_challenge_passed(student, challenge_name, score):
        """Notifier succès au challenge"""
        NotificationService.create_and_send_notification(
            user=student.user,
            notif_type='challenge_passed',
            title='🎉 Challenge réussi!',
            message=f'Vous avez réussi le challenge "{challenge_name}" avec un score de {score}%',
            action_url='/student/challenges/results',
            priority='high',
            related_object_type='challenge'
        )
    
    @staticmethod
    def notify_company_validated(company):
        """Notifier l'entreprise de sa validation"""
        NotificationService.create_and_send_notification(
            user=company.user,
            notif_type='company_validated',
            title='✅ Entreprise vérifiée!',
            message='Votre entreprise a été vérifiée. Vous pouvez maintenant publier des offres.',
            action_url='/company/dashboard',
            priority='high',
            related_object_type='company',
            related_object_id=company.id
        )
    
    @staticmethod
    def notify_offer_recommendation(student, offer):
        """Recommander une offre à l'étudiant"""
        NotificationService.create_and_send_notification(
            user=student.user,
            notif_type='offer_recommendation',
            title='💼 Offre recommandée pour vous',
            message=f"Nouvelle offre très compatible: {offer.title}",
            action_url=f'/student/offers/{offer.id}',
            priority='normal',
            related_object_type='offer',
            related_object_id=offer.id
        )
    
    @staticmethod
    def notify_convention_rejected(convention, reason):
        """Notifier du rejet de la convention"""
        # Notifier étudiant
        NotificationService.create_and_send_notification(
            user=convention.student.user,
            notif_type='convention_rejected',
            title='❌ Convention rejetée',
            message=f'La convention a été rejetée. Raison: {reason}',
            action_url=f'/student/conventions/{convention.id}',
            priority='high',
            related_object_type='convention',
            related_object_id=convention.id
        )
        
        # Notifier entreprise
        NotificationService.create_and_send_notification(
            user=convention.company.user,
            notif_type='convention_rejected',
            title='❌ Convention rejetée',
            message=f"La convention pour {convention.student.user.get_full_name()} a été rejetée. Raison: {reason}",
            action_url=f'/company/conventions/{convention.id}',
            priority='high',
            related_object_type='convention',
            related_object_id=convention.id
        )
