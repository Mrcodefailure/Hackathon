from django.urls import path
from . import views

urlpatterns = [
    path('create-room/', views.create_room, name='create_room'),
    path('room/<str:room_code>/', views.join_room, name='join_room'),
    path('meetingroom/', views.meeting_room_view, name='meetingroom'),
    path('', views.index_view, name='index'),
    path('loginSignup/', views.loginSignup_view, name='loginSignup'),
    path('join/', views.join_view, name='join'),
    path('settings/', views.settings_view, name='settings'),
    path('joinmeet/', views.joinmeet_view, name='joinmeet'),
    path('schedule/', views.schedule_view, name='schedule'),
    path('whiteboard/', views.whiteboard_view, name='whiteboard'),
    path('chat/<str:room_name>/', views.chat, name='chat'),
    path('join/<str:room_code>', views.join_code_view, name='join_room_preview'),
]
