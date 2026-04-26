from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from django.core.files.base import ContentFile
import uuid

class ConventionService:
    @staticmethod
    def generate_convention(application):
        """
        Génère une convention à partir d'une candidature acceptée
        """
        from ..models import Convention
        
        # Determine compensation from offer
        has_salary = bool(application.offer.salary and application.offer.salary.strip() and application.offer.salary.lower() != 'unpaid')
        
        # Extract durations assuming first option or defaulting
        duration = 1
        if application.offer.durations.exists():
            duration = application.offer.durations.first().months

        # Créer la convention
        convention = Convention.objects.create(
            application=application,
            student=application.student,
            company=application.offer.company,
            offer=application.offer,
            internship_title=application.offer.title,
            start_date=timezone.now().date(),  # Using now as placeholder
            end_date=timezone.now().date() + timezone.timedelta(days=30*duration),
            duration_months=duration,
            supervisor_name='To Be Defined',
            supervisor_email=application.offer.company.user.email,
            tasks={'description': application.offer.description, 'requirements': application.offer.requirements},
            compensation='Paid' if has_salary else 'Unpaid',
            compensation_amount=1000.00 if has_salary else 0.00,
            status='pending_student_signature',
            verification_code=uuid.uuid4().hex
        )
        
        # Générer le PDF initial
        ConventionService.regenerate_pdf(convention)
        
        return convention

    @staticmethod
    def reject_convention(convention, admin_user, reason):
        """
        Rejet par admin
        """
        convention.status = 'rejected'
        convention.rejection_reason = reason
        convention.rejected_at = timezone.now()
        convention.rejected_by = admin_user
        convention.save()
        return True

    @staticmethod
    def regenerate_pdf(convention, final=False):
        """
        Régénère le PDF de la convention avec les signatures actuelles
        """
        from reportlab.lib.units import cm
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # HEADER
        p.setFont("Helvetica-Bold", 18)
        p.drawCentredString(width/2, height - 2*cm, "CONVENTION DE STAGE")
        
        if final:
            p.setFont("Helvetica-Bold", 12)
            p.setFillColorRGB(0, 0.5, 0)
            p.drawCentredString(width/2, height - 3*cm, "✓ VALIDÉE ET SIGNÉE")
            p.setFillColorRGB(0, 0, 0)
        
        # CONTENU
        y = height - 5*cm
        p.setFont("Helvetica-Bold", 14)
        p.drawString(2*cm, y, "PARTIES SIGNATAIRES")
        
        y -= 1*cm
        p.setFont("Helvetica", 11)
        
        # Étudiant
        p.drawString(2*cm, y, "L'ÉTUDIANT(E):")
        y -= 0.5*cm
        p.drawString(2.5*cm, y, f"Nom: {convention.student.user.get_full_name()}")
        y -= 0.4*cm
        p.drawString(2.5*cm, y, f"Matricule: {convention.student.id}")
        y -= 0.4*cm
        p.drawString(2.5*cm, y, f"Université: {convention.student.university}")
        
        y -= 1*cm
        
        # Entreprise
        p.drawString(2*cm, y, "L'ENTREPRISE:")
        y -= 0.5*cm
        p.drawString(2.5*cm, y, f"Raison sociale: {convention.company.company_name}")
        y -= 0.4*cm
        p.drawString(2.5*cm, y, f"RC: {convention.company.registre_commerce}")
        y -= 0.4*cm
        p.drawString(2.5*cm, y, f"NIF: {convention.company.nif}")
        
        y -= 1.5*cm
        
        # Détails du stage
        p.setFont("Helvetica-Bold", 14)
        p.drawString(2*cm, y, "DÉTAILS DU STAGE")
        y -= 1*cm
        p.setFont("Helvetica", 11)
        
        p.drawString(2*cm, y, f"Intitulé: {convention.internship_title}")
        y -= 0.5*cm
        p.drawString(2*cm, y, f"Durée: {convention.duration_months} mois")
        y -= 0.5*cm
        p.drawString(2*cm, y, f"Du {convention.start_date} au {convention.end_date}")
        y -= 0.5*cm
        p.drawString(2*cm, y, f"Encadrant: {convention.supervisor_name}")
        
        y -= 2*cm
        
        # SIGNATURES AVEC EMPREINTE DIGITALE
        p.setFont("Helvetica-Bold", 14)
        p.drawString(2*cm, y, "SIGNATURES ÉLECTRONIQUES")
        y -= 1*cm
        
        # Signature Étudiant
        p.setFont("Helvetica-Bold", 11)
        p.drawString(2*cm, y, "L'ÉTUDIANT(E):")
        y -= 0.5*cm
        p.setFont("Helvetica", 10)
        
        if convention.student_signed:
            p.setFillColorRGB(0, 0.5, 0)
            p.drawString(2.5*cm, y, "✓ Signé électroniquement")
            y -= 0.4*cm
            p.setFillColorRGB(0, 0, 0)
            p.drawString(2.5*cm, y, f"Par: {convention.student.user.get_full_name()}")
            y -= 0.4*cm
            p.drawString(2.5*cm, y, f"Date: {convention.student_signed_at.strftime('%d/%m/%Y à %H:%M')}")
            y -= 0.4*cm
            if getattr(convention, 'student_fingerprint_authenticated', False):
                p.drawString(2.5*cm, y, "🔐 Authentifié par empreinte digitale")
                y -= 0.4*cm
                p.setFont("Helvetica", 8)
                p.drawString(2.5*cm, y, f"IP: {getattr(convention, 'student_ip_address', 'N/A')}")
        else:
            p.setFillColorRGB(0.7, 0.7, 0.7)
            p.drawString(2.5*cm, y, "En attente de signature...")
            p.setFillColorRGB(0, 0, 0)
        
        y -= 1*cm
        
        # Signature Entreprise
        p.setFont("Helvetica-Bold", 11)
        p.drawString(2*cm, y, "L'ENTREPRISE:")
        y -= 0.5*cm
        p.setFont("Helvetica", 10)
        
        if convention.company_signed:
            p.setFillColorRGB(0, 0.5, 0)
            p.drawString(2.5*cm, y, "✓ Signé électroniquement")
            y -= 0.4*cm
            p.setFillColorRGB(0, 0, 0)
            p.drawString(2.5*cm, y, f"Par: {convention.company.user.get_full_name()}")
            y -= 0.4*cm
            p.drawString(2.5*cm, y, f"Date: {convention.company_signed_at.strftime('%d/%m/%Y à %H:%M')}")
            y -= 0.4*cm
            if getattr(convention, 'company_fingerprint_authenticated', False):
                p.drawString(2.5*cm, y, "🔐 Authentifié par empreinte digitale")
                y -= 0.4*cm
                p.setFont("Helvetica", 8)
                p.drawString(2.5*cm, y, f"IP: {getattr(convention, 'company_ip_address', 'N/A')}")
        else:
            p.setFillColorRGB(0.7, 0.7, 0.7)
            p.drawString(2.5*cm, y, "En attente de signature...")
            p.setFillColorRGB(0, 0, 0)
        
        y -= 1*cm
        
        # Signature Admin
        p.setFont("Helvetica-Bold", 11)
        p.drawString(2*cm, y, "L'UNIVERSITÉ (Validation):")
        y -= 0.5*cm
        p.setFont("Helvetica", 10)
        
        if convention.admin_signed:
            p.setFillColorRGB(0, 0.5, 0)
            p.drawString(2.5*cm, y, "✓ Validé et signé électroniquement")
            y -= 0.4*cm
            p.setFillColorRGB(0, 0, 0)
            p.drawString(2.5*cm, y, f"Date: {convention.admin_signed_at.strftime('%d/%m/%Y à %H:%M')}")
            y -= 0.4*cm
            admin_full_name = convention.admin_signed_by.get_full_name() if convention.admin_signed_by else "Admin"
            p.drawString(2.5*cm, y, f"Par: {admin_full_name}")
            y -= 0.4*cm
            if getattr(convention, 'admin_fingerprint_authenticated', False):
                p.drawString(2.5*cm, y, "🔐 Authentifié par empreinte digitale")
                y -= 0.4*cm
                p.setFont("Helvetica", 8)
                p.drawString(2.5*cm, y, f"IP: {getattr(convention, 'admin_ip_address', 'N/A')}")
        else:
            p.setFillColorRGB(0.7, 0.7, 0.7)
            p.drawString(2.5*cm, y, "En attente de validation...")
            p.setFillColorRGB(0, 0, 0)
        
        # FOOTER - Code de vérification
        p.setFont("Helvetica", 8)
        p.drawString(2*cm, 2*cm, f"Code de vérification: {convention.verification_code}")
        p.drawString(2*cm, 1.5*cm, f"Généré le: {timezone.now().strftime('%d/%m/%Y à %H:%M')}")
        
        if final:
            p.setFillColorRGB(0, 0.5, 0)
            p.setFont("Helvetica-Bold", 9)
            p.drawString(2*cm, 1*cm, "Ce document est légalement valide et a été signé électroniquement")
            p.setFillColorRGB(0, 0, 0)
        
        # Générer
        p.showPage()
        p.save()
        
        # Sauvegarder
        pdf_content = buffer.getvalue()
        buffer.close()
        
        filename = f'convention_{convention.id}_final.pdf' if final else f'convention_{convention.id}.pdf'
        convention.pdf_file.save(filename, ContentFile(pdf_content), save=True)
        convention.pdf_generated_at = timezone.now()
        convention.save()
        
        return convention
