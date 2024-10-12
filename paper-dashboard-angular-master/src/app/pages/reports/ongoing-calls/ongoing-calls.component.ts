import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { interval, Subscription } from "rxjs";
import { OngoingCalldtlsService } from "services/ongoing-calldtls.service";

interface CallData {
  callId: number;
  callerNumber: string;
  callDate: string;
  callStartTime: string;
  callEndTime: string;
  party: string;
  botChat: string;
  agentChat: string;
  botChatHistory?: { id: number; sender: string; message: string }[]; // Bot chat history
}

@Component({
  selector: "app-ongoing-calls",
  templateUrl: "./ongoing-calls.component.html",
  styleUrls: ["./ongoing-calls.component.scss"],
})
export class OngoingCallsComponent implements OnInit, AfterViewChecked {
  ongoingCalls: any = [];
  selectedBotChat: { sender: string; message: string }[] = []; // Chat history to display
  showModal: boolean = false; // Control modal visibility
  displayedColumns: string[] = [
    "callId",
    "callerNumber",
    "callStartTime",
    "party",
    "botChat",
  ];
  private intervalId: any;
  totalSentiment: number = 0;
  pollingSubscription: Subscription;
  constructor(private calldtlsservice: OngoingCalldtlsService) {}

  ngOnInit(): void {
    this.livecallreport();
    // Set up interval to call a function every 5 seconds
    this.intervalId = setInterval(() => {
      this.livecallreport();
    }, 500000);


  }

  livecallreport() {
    this.calldtlsservice.getlivecalls().subscribe((resp: any) => {
      console.log(resp.data,"livecalldatarespp");
      
      this.ongoingCalls = resp.data;
    });
  }

  // Open modal and load the chat history for the clicked row
  // openBotChat(call: CallData): void {
  //   this.selectedBotChat = call.botChatHistory;
  //   this.showModal = true;

  //   this.calldtlsservice.getagentcalls(call.callId).subscribe((resp: any) => {
  //     console.log("resp -- ", resp);
  //     let data = resp.data;
  //     data.forEach((element) => {
  //       call.botChatHistory.push({
  //         sender: "Customer",
  //         message: element.question,
  //       });
  //       call.botChatHistory.push({ sender: "Bot", message: element.answer });
  //     });
  //   });
  // }

  openBotChat(call: CallData): void {
    if (!Array.isArray(call.botChatHistory)) {
      call.botChatHistory = [];
    }
    this.selectedBotChat = call.botChatHistory;
    this.showModal = true;

    // Start polling the service every second (1000 ms)
    this.pollingSubscription = interval(1000).subscribe(() => {
      this.calldtlsservice.getagentcalls(call.callId).subscribe((resp: any) => {
        let data = resp.data;
        let data1=resp.sentiment;
      this.totalSentiment=data1;
        data.forEach((element) => {
          // Check if the element is already in botChatHistory by matching an identifier, e.g., element.id
          const existsInChatHistory = call.botChatHistory?.some(
            (chat) => chat.id === element.id
          );

          if (!existsInChatHistory) {
            call.botChatHistory.push({
              id: element.id,
              sender: "Customer",
              message: element.question,
            });
            call.botChatHistory.push({
              id: element.id,
              sender: "Bot",
              message: element.answer,
            });
          }
        });
      });
    });
  }

  @ViewChild("chatBox") private chatBox: ElementRef;

  // Scroll to the bottom of the chat box
  private scrollToBottom(): void {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop =
        this.chatBox.nativeElement.scrollHeight;
    }
  }

  // Scroll after each view update
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  closeModal(): void {
    this.showModal = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    // Clear interval on component destruction to prevent memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
