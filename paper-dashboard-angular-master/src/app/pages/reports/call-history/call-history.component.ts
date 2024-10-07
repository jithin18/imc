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
  selector: 'app-call-history',
  templateUrl: './call-history.component.html',
  styleUrls: ['./call-history.component.scss']
})
export class CallHistoryComponent implements OnInit {

  ongoingCalls: any = [];
  selectedBotChat: { sender: string, message: string }[] = [];  // Chat history to display
  showModal: boolean = false;  // Control modal visibility
  displayedColumns: string[] = ['callId', 'callerNumber', 'callDate', 'callStartTime', 'callEndTime', 'botChat', 'agentChat'];	
  selectedTimePeriod: string = 'today';
  constructor() { }

  ngOnInit(): void {
    this.ongoingCalls = [
      {
        callId: 100001,
        callerNumber: '8921354621',
        callDate: '04-10-2024',
        callStartTime: '18:36:33',
        callEndTime: '18:39:33',
        botChat: '+',
        agentChat: '-',
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
        callStartTime: '19:36:33',
        callEndTime: '19:39:33',
        botChat: '+',
        agentChat: '-',
       
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
        callStartTime: '19:37:33',
        callEndTime: '19:40:33',
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
        callStartTime: '19:38:33',
        callEndTime: '19:41:33',
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
        callStartTime: '19:39:33',
        callEndTime: '19:42:33',
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
        callStartTime: '19:40:33',
        callEndTime: '19:43:33',
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
        callStartTime: '19:41:33',
        callEndTime: '19:44:33',
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
        callStartTime: '19:42:33',
        callEndTime: '19:45:33',
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
        callStartTime: '19:43:33',
        callEndTime: '19:46:33',
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
        callStartTime: '19:44:33',
        callEndTime: '19:47:33',
        botChat: '+',
       
        botChatHistory: [
          { sender: 'Bot', message: 'Welcome, how can I help you today?' },
          { sender: 'Customer', message: 'I have poor network coverage.' },
          { sender: 'Bot', message: 'Let me check your area for issues.' }
        ]
      }
    ];
  }

  openBotChat(call: CallData): void {
    this.selectedBotChat = call.botChatHistory || [];
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
  }

}
