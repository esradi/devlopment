import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

class AdminExporter:
    """
    Utility class to generate styled Excel files from querysets
    """

    @staticmethod
    def export_users_to_excel(queryset):
        wb = Workbook()
        ws = wb.active
        ws.title = "Users Export"

        # Headers
        headers = [
            "ID", "Email", "First Name", "Last Name", 
            "Role", "Date Joined", "ID Verified", "Suspended"
        ]
        
        # Style Headers
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")

        # Data
        for row, user in enumerate(queryset, 2):
            ws.cell(row=row, column=1, value=user.id)
            ws.cell(row=row, column=2, value=user.email)
            ws.cell(row=row, column=3, value=user.first_name)
            ws.cell(row=row, column=4, value=user.last_name)
            ws.cell(row=row, column=5, value=user.role)
            ws.cell(row=row, column=6, value=user.date_joined.strftime("%Y-%m-%d %H:%M"))
            ws.cell(row=row, column=7, value="Yes" if user.id_verified else "No")
            ws.cell(row=row, column=8, value="Yes" if user.is_suspended else "No")

        # Column width
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = 20

        # Save to buffer
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer
