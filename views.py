from django.shortcuts import render, redirect
from django.conf import settings
import uuid
import os
import random
import string

def index_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/index.html')
    return render(request, template_path)

def meeting(request, room_code=None):
    return render(request, 'meet/meeting.html', {'room_code': room_code})

def create_room(request):
    room_code = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    return redirect('meeting', room_code=room_code)

def chat(request, room_name):
    return render(request, 'chat.html', {
        'room_name': room_name
    })

def join_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/join.html')
    return render(request, template_path)

def joinmeet_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/joinmeet.html')
    return render(request, template_path)

def loginSignup_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/loginSignup.html')
    return render(request, template_path)

def schedule_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/schedule.html')
    return render(request, template_path)

def settings_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/settings.html')
    return render(request, template_path)

def whiteboard_view(request):
    template_path = os.path.join(settings.BASE_DIR, 'connection/templates/whiteboard.html')
    return render(request, template_path)

def create_room(request):
    # Generate unique room code
    room_code = str(uuid.uuid4())[:8]
    return redirect(f'/room/{room_code}/')

def join_room(request, room_code):
    # Render room page with the given room code
    return render(request, 'meetingroom.html', {'room_code': room_code})

def meeting_room_view(request):
    return render(request, 'meetingroom.html')

def join_code_view(request, room_code):
    return render(request, 'join.html', {'room_code': room_code})
