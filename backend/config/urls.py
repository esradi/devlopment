from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD
from django.conf import settings
from django.conf.urls.static import static
=======
from django.http import HttpResponse

def root_view(request):
    return HttpResponse("<h1>Stage-IO API</h1><p>The backend is running. Please access the application via the frontend at <a href='http://localhost:5173/'>http://localhost:5173/</a></p>")
>>>>>>> 0d15fe8 (feat: updated serializers and added student dashboard pages)

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
