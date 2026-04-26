from rest_framework import serializers
from django.utils import timezone
from apps.companyapp.models import Interview, InterviewReminder

class ApplicationCompanySerializer(serializers.Serializer):
    id = serializers.IntegerField(source='offer.company.id')
    company_name = serializers.CharField(source='offer.company.company_name')
    logo = serializers.SerializerMethodField()
    industry = serializers.CharField(source='offer.company.industry', default='')
    
    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.offer.company.logo and hasattr(obj.offer.company.logo, 'url'):
            if request:
                return request.build_absolute_uri(obj.offer.company.logo.url)
            return obj.offer.company.logo.url
        return None

class ApplicationOfferSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='offer.id')
    title = serializers.CharField(source='offer.title')
    company = ApplicationCompanySerializer(source='*')

class InterviewApplicationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    offer = ApplicationOfferSerializer(source='*')
    status = serializers.CharField()
    match_score = serializers.IntegerField(default=87)

class ProposedSlotSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date_time = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField()
    is_selected = serializers.BooleanField()

class InterviewReminderSerializer(serializers.ModelSerializer):
    scheduled_for = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewReminder
        fields = ['type', 'scheduled_for', 'message']
        
    def get_scheduled_for(self, obj):
        if obj.interview.scheduled_at:
            return obj.interview.scheduled_at + timezone.timedelta(minutes=obj.offset_minutes)
        return None
        
    def get_message(self, obj):
        return f"Rappel: {obj.label}"

class StudentInterviewDetailSerializer(serializers.ModelSerializer):
    application = InterviewApplicationSerializer()
    proposed_slots = serializers.SerializerMethodField()
    selected_slot = serializers.SerializerMethodField()
    type = serializers.CharField(source='interview_type')
    interviewer = serializers.SerializerMethodField()
    time_info = serializers.SerializerMethodField()
    reminders = InterviewReminderSerializer(many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'status', 'proposed_slots', 'selected_slot',
            'type', 'meeting_link', 'location', 'interviewer', 'time_info',
            'student_confirmed', 'student_confirmed_at', 'reminders',
            'created_at'
        ]
        
    def get_proposed_slots(self, obj):
        slots = []
        if obj.proposed_spot_1:
            slots.append({"id": 1, "date_time": obj.proposed_spot_1, "duration_minutes": obj.duration_minutes, "is_selected": obj.scheduled_at == obj.proposed_spot_1})
        if obj.proposed_spot_2:
            slots.append({"id": 2, "date_time": obj.proposed_spot_2, "duration_minutes": obj.duration_minutes, "is_selected": obj.scheduled_at == obj.proposed_spot_2})
        if obj.proposed_spot_3:
            slots.append({"id": 3, "date_time": obj.proposed_spot_3, "duration_minutes": obj.duration_minutes, "is_selected": obj.scheduled_at == obj.proposed_spot_3})
        return slots
        
    def get_selected_slot(self, obj):
        if not obj.scheduled_at: return None
        return {
            "date_time": obj.scheduled_at,
            "duration_minutes": obj.duration_minutes,
            "end_time": obj.scheduled_at + timezone.timedelta(minutes=obj.duration_minutes)
        }
        
    def get_interviewer(self, obj):
        user = obj.company.user
        return {
            "name": user.get_full_name() or "Recruteur",
            "title": "Recruteur",
            "email": user.email,
            "phone": getattr(user, 'phone_number', None)
        }
        
    def get_time_info(self, obj):
        now = timezone.now()
        is_upcoming = obj.scheduled_at and obj.scheduled_at > now
        time_until_minutes = int((obj.scheduled_at - now).total_seconds() / 60) if is_upcoming else 0
        
        return {
            "is_upcoming": is_upcoming,
            "is_today": obj.scheduled_at and obj.scheduled_at.date() == now.date(),
            "is_past": obj.scheduled_at and obj.scheduled_at < now,
            "time_until_minutes": time_until_minutes,
            "can_reschedule": is_upcoming and time_until_minutes > 24 * 60,
        }

class StudentUpcomingInterviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    company_name = serializers.CharField(source='company.company_name')
    company_logo = serializers.SerializerMethodField()
    offer_title = serializers.CharField(source='application.offer.title')
    date_time = serializers.DateTimeField(source='scheduled_at')
    duration_minutes = serializers.IntegerField()
    type = serializers.CharField(source='interview_type')
    status = serializers.CharField()
    meeting_link = serializers.URLField()
    is_today = serializers.SerializerMethodField()
    is_tomorrow = serializers.SerializerMethodField()
    
    def get_company_logo(self, obj):
        request = self.context.get('request')
        if obj.company.logo and hasattr(obj.company.logo, 'url'):
            if request: return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None
        
    def get_is_today(self, obj):
        if not obj.scheduled_at: return False
        return obj.scheduled_at.date() == timezone.now().date()
        
    def get_is_tomorrow(self, obj):
        if not obj.scheduled_at: return False
        return obj.scheduled_at.date() == (timezone.now() + timezone.timedelta(days=1)).date()

class StudentPastInterviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    company_name = serializers.CharField(source='company.company_name')
    offer_title = serializers.CharField(source='application.offer.title')
    date_time = serializers.DateTimeField(source='scheduled_at')
    status = serializers.CharField()
    outcome = serializers.CharField()
    duration_actual_minutes = serializers.IntegerField(source='duration_minutes')
    can_view_feedback = serializers.BooleanField(default=False)

class StudentPendingInterviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    company_name = serializers.CharField(source='company.company_name')
    offer_title = serializers.CharField(source='application.offer.title')
    status = serializers.CharField()
    proposed_slots_count = serializers.SerializerMethodField()
    deadline_to_select = serializers.SerializerMethodField()
    urgent = serializers.BooleanField(default=True)
    
    def get_proposed_slots_count(self, obj):
        count = 0
        if obj.proposed_spot_1: count += 1
        if obj.proposed_spot_2: count += 1
        if obj.proposed_spot_3: count += 1
        return count
        
    def get_deadline_to_select(self, obj):
        if obj.created_at:
            return obj.created_at + timezone.timedelta(days=3)
        return None
