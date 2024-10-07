import { Component, OnInit } from '@angular/core';

interface CallData {
  callId: number;
  callerNumber: string;
  callDate: string;
  callStartTime: string;
  callEndTime: string;
  botChat: string;
  agentChat: string;
  botChatHistory?: { sender: string, message: string }[];  // Bot chat history
}

@Component({
  selector: 'app-ongoing-calls',
  templateUrl: './ongoing-calls.component.html',
  styleUrls: ['./ongoing-calls.component.scss']
})
export class OngoingCallsComponent implements OnInit {

  ongoingCalls: any = [];
  selectedBotChat: { sender: string, message: string }[] = [];  // Chat history to display
  showModal: boolean = false;  // Control modal visibility
  displayedColumns: string[] = ['callId', 'callerNumber', 'callDate', 'callStartTime', 'callEndTime', 'botChat'];

  constructor() { }

  ngOnInit(): void {
    // Simulating fetching call data from a service or API
    this.ongoingCalls = [
      {
        callId: 100001,
        callerNumber: '8921354621',
        callDate: '04-10-2024',
        callStartTime: '18:36:33',
        callEndTime: '18:39:44',
        botChat: '+',
        
        botChatHistory: [
          { sender: 'Bot', message: 'Hello, how can I assist you?' },
          { sender: 'Customer', message: 'I have an issue with my telecom plan.' },
          { sender: 'Bot', message: 'Can you specify the issue?' },
          { sender: 'Customer', message: 'I’m being charged extra for data.' }
        ]
      },
      {
        callId: 100002,
        callerNumber: '8921354622',
        callDate: '05-10-2024',
        callStartTime: '19:36:45',
        callEndTime: '19:39:55',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100003,
        callerNumber: '8921354623',
        callDate: '05-10-2024',
        callStartTime: '19:37:05',
        callEndTime: '19:40:25',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100004,
        callerNumber: '8921354624',
        callDate: '05-10-2024',
        callStartTime: '19:38:35',
        callEndTime: '19:41:55',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100005,
        callerNumber: '8921354625',
        callDate: '05-10-2024',
        callStartTime: '19:39:03',
        callEndTime: '19:42:22',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100006,
        callerNumber: '8921354626',
        callDate: '05-10-2024',
        callStartTime: '19:40:28',
        callEndTime: '19:43:48',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100007,
        callerNumber: '8921354627',
        callDate: '05-10-2024',
        callStartTime: '19:41:49',
        callEndTime: '19:44:55',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100008,
        callerNumber: '8921354628',
        callDate: '05-10-2024',
        callStartTime: '19:36:40',
        callEndTime: '19:39:59',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100009,
        callerNumber: '8921354629',
        callDate: '05-10-2024',
        callStartTime: '19:36:48',
        callEndTime: '19:39:15',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      },
      {
        callId: 100010,
        callerNumber: '8921354630',
        callDate: '05-10-2024',
        callStartTime: '19:38:03',
        callEndTime: '19:39:33',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      }
    ];
  }

  // Open modal and load the chat history for the clicked row
  openBotChat(call: CallData): void {
    this.selectedBotChat = call.botChatHistory || [];
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
  }

}
