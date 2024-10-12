import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort"; 
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { OngoingCalldtlsService } from "services/ongoing-calldtls.service";
import { ExcelService } from "services/excel.service";

interface CallData {
  callId: number;
  callerNumber: string;
  callDate: string;
  callStartTime: string;
  callEndTime: string;
  botChat: string;
  callRecordings: string;
  botChatHistory?: { id: number; sender: string; message: string }[]; // Bot chat history
  
}

@Component({
  selector: "app-call-history",
  templateUrl: "./call-history.component.html",
  styleUrls: ["./call-history.component.scss"],
})
export class CallHistoryComponent implements OnInit, AfterViewChecked, OnDestroy {
  ongoingCalls = new MatTableDataSource<CallData>([]);
  selectedBotChat: { sender: string; message: string }[] = [];
  showModal: boolean = false;
  loading = false;
  selectedTimePeriod: string = 'today';
  totalSentiment: number = 0;
  callDetails: any[] = [];
  displayedColumns: string[] = [
    "callId",
    "callerNumber",
    "callDate",
    "callStartTime",
    "callEndTime",
    "botChat",
    "callRecordings"
  ];

  @ViewChild("chatBox") private chatBox: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Use definite assignment assertion
  @ViewChild(MatSort) sort!: MatSort; 
  private pollingSubscription!: Subscription; // Ensure subscription is initialized
  public dateRange: { from_date: string; to_date: string } | undefined;

  constructor(private calldtlsservice: OngoingCalldtlsService,private excelService: ExcelService) {}

  ngOnInit(): void {
    this.setDateRange();
  }

  ngAfterViewInit(): void {
    this.ongoingCalls.sort = this.sort;
    this.ongoingCalls.paginator = this.paginator; // Bind paginator after view init
    this.livecallreport(); // Fetch initial data after setting paginator
  }

  livecallreport() {
    if (!this.dateRange) return;

    this.calldtlsservice.getcallhistory(this.dateRange).subscribe((resp: any) => {
      this.ongoingCalls.data = resp.data; // Update the MatTableDataSource with the response data
      console.log(resp.data, "livecallreport");
    });
  }

 
  

  setDateRange() {
    const currentDate = new Date();
    let fromDate: Date;
    let toDate: Date = currentDate;

    switch (this.selectedTimePeriod) {
      case 'today':
        fromDate = toDate;
        break;
      case 'yesterday':
        fromDate = new Date(currentDate);
        fromDate.setDate(currentDate.getDate() - 1);
        toDate = fromDate;
        break;
      case 'last7days':
        fromDate = new Date(currentDate);
        fromDate.setDate(currentDate.getDate() - 6);
        break;
      default:
        fromDate = toDate;
        break;
    }

    this.dateRange = {
      from_date: this.formatDate(fromDate),
      to_date: this.formatDate(toDate),
    };

    this.livecallreport(); // Fetch the call history after setting the date range
  
  }

  // downloadCallDetails() {

  //   console.log(this.dateRange, "daterane");
    
  //   if (this.dateRange) {
  //     // Fetch call history data first
  //     this.calldtlsservice.getcallhistory(this.dateRange).subscribe((resp: any) => {
  //       console.log(resp, "respx");

  //       // Assuming resp.data contains the required call history
  //       this.callDetails = resp.data; // Store the fetched call history
  //      console.log(this.callDetails,"call details");
       
  //       const flag = 'Call Details for ' + this.dateRange.from_date + ' to ' + this.dateRange.to_date;
  //       this.excelService.exportAsExcelFile(this.callDetails, flag);
  //     });
  //   } else {
  //     console.error('Date range is not selected.');
  //     // Optionally show a user-friendly message to the user
  //   }
  // }

  downloadCallDetails() {
    this.loading = true; // Set loading to true when starting the download
    
  
    if (this.dateRange) {
      this.calldtlsservice.getcallhistory(this.dateRange).subscribe((resp: any) => {
       
  
        // Process response and export logic
        const processedCalls = resp.data.map((call) => {
          // Process botChat in a cleaner way to avoid multiple JSON.parse calls
          return {
            ...call,
            botChat: this.processBotChat(call.botChat),
          };
        });
  
    
  
        const flag = 'Call Details for ' + this.dateRange.from_date + ' to ' + this.dateRange.to_date;
  
        this.excelService.exportAsExcelFile(processedCalls, flag);
        this.loading = false; // Set loading to false after processing
      }, error => {
        console.error('Error fetching call history:', error);
        this.loading = false; // Ensure loading is reset on error
      });
    } else {
      console.error('Date range is not selected.');
      this.loading = false; // Reset loading if no date range is selected
    }
  }
  
  private processBotChat(botChat: string): string {
    if (!botChat) {
      return "No Bot Chat";
    }
  
    try {
      const parsedBotChat = JSON.parse(botChat);
      return parsedBotChat.map((chat: any) => `Q: ${chat.question}\nA: ${chat.answer}`).join("\n\n");
    } catch (error) {
      console.error("Error parsing botChat:", error);
      return "Invalid botChat data"; // Fallback if parsing fails
    }
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

 
  
  openBotChat(call: CallData): void {
    if (!Array.isArray(call.botChatHistory)) {
      call.botChatHistory = [];
    }
    this.selectedBotChat = call.botChatHistory;

    this.showModal = true;

    this.calldtlsservice.getagentcalls(call.callId).subscribe((resp: any) => {
      let data = resp.data;
      let data1 = resp.sentiment;
      this.totalSentiment = data1;

      data.forEach((element) => {
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
      });
    });
  }

  private scrollToBottom(): void {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop =
        this.chatBox.nativeElement.scrollHeight;
    }
  }

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
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
