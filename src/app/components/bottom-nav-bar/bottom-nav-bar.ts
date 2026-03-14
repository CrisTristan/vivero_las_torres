import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';


@Component({
  selector: 'app-bottom-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav-bar.html',
  styleUrl: './bottom-nav-bar.css',
})
export class BottomNavBar {
  // private chatInstance: any;

  // ngOnInit() {
  //   this.chatInstance = createChat({
  //     webhookUrl: '',
  //     webhookConfig: {
  //       method: 'POST',
  //       headers: {},
  //     },
  //     target: '#n8n-chat',
  //     mode: 'fullscreen',
  //     chatInputKey: 'chatInput',
  //     chatSessionKey: 'sessionId',
  //     loadPreviousSession: true,
  //     metadata: {},
  //     showWelcomeScreen: false,
  //     defaultLanguage: 'en',
  //     initialMessages: ['Hi there! 👋', 'My name is Nathan. How can I assist you today?'],
  //     i18n: {
  //       en: {
  //         title: 'Hi there! 👋',
  //         subtitle: "Start a chat. We're here to help you 24/7.",
  //         footer: '',
  //         getStarted: 'New Conversation',
  //         inputPlaceholder: 'Type your question..',
  //         closeButtonTooltip: 'Close chat',
  //       },
  //     },
  //     enableStreaming: false,
  //   });
  // }

  // ngOnDestroy() {
  //   if (this.chatInstance) {
  //     this.chatInstance.destroy?.();
  //   }
  // }
}
