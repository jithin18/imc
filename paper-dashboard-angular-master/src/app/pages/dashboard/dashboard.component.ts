
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { ChartEvent } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as bootstrap from 'bootstrap';
import { ExcelService } from 'services/excel.service';
import { commonservice } from 'services/common.service';
//import {Target} from 'lucide-angular'
interface Question {
  text: string; // The question text
  count: number; // The count of responses
  sentiment: 'positive' | 'negative' | 'neutral'; // Sentiment type
  emoji: string;
}

@Component({
  selector: 'dashboard-cmp',
  moduleId: module.id,
  templateUrl: 'dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public chartColor: string;
  public chartHours: Chart | undefined;
  public chartEmail: Chart | undefined;
  public fileStatusChart: Chart | undefined;
  public peakHourChart: Chart | undefined;
  public sentimentChart: Chart | undefined;

  public transferData: { keyword: string, negativeWord: number, noAnswer: number }[] = [];
  public sentimentScore: number = 70; // Example average sentiment score
  public questions: Question[] = [];
  selectedTimePeriod: string = 'today';
  selectedSentiment: string = 'all';
  totalCalls: number = 0;
  callDuration: string = ''; // Store as string for display purposes
  avgCallHandlingTime: string = ''; // Store as string for display purposes
  public allQuestions: Question[] = [];
  public dateRange: { from_date: string; to_date: string } | undefined;
  constructor(private excelService: ExcelService,private commonservice:commonservice) {}
  ngOnInit() {
    this.chartColor = "#FFFFFF";
   
    this.createPeakHourChart(); // Call the new peak hour chart creation method
    this.createSentimentChart();
    this.loadTransferRatioData();
    this.loadSentimentData();
    this.setDateRange();
  }

  // setDateRange() {
  //   const currentDate = new Date();
  //   let fromDate: Date;
  //   let toDate: Date = currentDate;

  //   // Set the date range based on your selected time period logic
  //   if (this.selectedTimePeriod === 'today') {
  //     fromDate = toDate;
  //   } else if (this.selectedTimePeriod === 'yesterday') {
  //     fromDate = new Date(currentDate);
  //     fromDate.setDate(currentDate.getDate() - 1);
  //     toDate = fromDate;
  //   } else if (this.selectedTimePeriod === 'last7days') {
  //     fromDate = new Date(currentDate);
  //     fromDate.setDate(currentDate.getDate() - 6);
  //   } else {
  //     fromDate = toDate;
  //   }

  //   this.dateRange = {
  //     from_date: this.formatDate(fromDate),
  //     to_date: this.formatDate(toDate)
  //   };

  //   console.log('Selected Date Range:', this.dateRange);

  //   // Call the commonservice method and subscribe to the response
  //   this.commonservice.getagentcalls(this.dateRange).subscribe((data) => {
  //     console.log(data, "data");
  //     // Handle the response
  //   });
  // }

  // formatDate(date: Date): string {
  //   const day = ('0' + date.getDate()).slice(-2);
  //   const month = ('0' + (date.getMonth() + 1)).slice(-2);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
// downloadKeywords(flag: string) {
//   let transformedData;

//   if (flag === 'positive' || flag === 'negative' || flag === 'neutral') {
//     // Only return the keyword and count columns
//     transformedData = this.allQuestions
//       .filter((question) => question.sentiment === flag)
//       .map((question) => ({
//         FAQ: question.text,
//         count: question.count
//       }));
//   } else {
//     // Include positive, negative, and neutral columns for "Top Keywords"
//     transformedData = this.allQuestions.map((question) => ({
//       FAQ: question.text,
//       count: question.count,
//       positive: question.sentiment === 'positive' ? '✓' : '',
//       negative: question.sentiment === 'negative' ? '✓' : '',
//       neutral: question.sentiment === 'neutral' ? '✓' : ''
//     }));
//   }

//   // Export the filtered data to Excel
//   this.excelService.exportAsExcelFile(transformedData, flag + 'Keywords');
// }

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

  console.log('Selected Date Range:', this.dateRange);

  // Call the commonservice method and subscribe to the response
  this.commonservice.getagentcalls(this.dateRange).subscribe((data:any) => {
    console.log(data, "data");
    if (data.status === 200) {
      const vJsonOut = JSON.parse(data.data.v_json_out);
      console.log(vJsonOut, "vJsonOut");
      
      this.totalCalls = vJsonOut.total_calls; // Total number of calls
      console.log(this.totalCalls, "totalCalls");
      
      this.callDuration = vJsonOut.duration; // Format duration to hours and minutes
      console.log(this.callDuration, "callDuration");	
      
      this.avgCallHandlingTime = vJsonOut.avg_hndl_time; // Format avg handling time to hh:mm:ss
      console.log(this.avgCallHandlingTime, "avgCallHandlingTime");
    }
  });
}

formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return formattedDuration;
}

formatDate(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
loadSentimentData() {
  this.allQuestions = [
    { text: 'I am very satisfied with the service.', count: 10, sentiment: 'positive', emoji: '😊' },
    { text: 'The telecom customer service was very responsive.', count: 8, sentiment: 'positive', emoji: '😊' },
    { text: 'How reliable is the network coverage in remote areas?', count: 7, sentiment: 'positive', emoji: '😊' },
    { text: 'Call drops are a frequent issue.', count: 6, sentiment: 'negative', emoji: '😞' },
    { text: 'Why does the network performance degrade during peak hours?', count: 5, sentiment: 'negative', emoji: '😞' },
    { text: 'I appreciate the affordable plans offered.', count: 5, sentiment: 'positive', emoji: '😊' },
    { text: 'What are the key differences between prepaid and postpaid plans?', count: 4, sentiment: 'neutral', emoji: '😐' },
    { text: 'It was an average experience with the service.', count: 4, sentiment: 'neutral', emoji: '😐' },
    { text: 'The internet speed has greatly improved.', count: 4, sentiment: 'positive', emoji: '😊' },
    { text: 'The pricing structure is reasonable.', count: 4, sentiment: 'neutral', emoji: '😐' },
    { text: 'I find the customer support hours adequate.', count: 3, sentiment: 'neutral', emoji: '😐' },
    { text: 'The service is decent but could improve.', count: 2, sentiment: 'neutral', emoji: '😐' },
    { text: 'I am very dissatisfied with the service.', count: 4, sentiment: 'negative', emoji: '😞' },
    { text: 'The billing process is confusing and complicated.', count: 3, sentiment: 'negative', emoji: '😞' },
    { text: 'The service often has unexpected outages.', count: 2, sentiment: 'negative', emoji: '😞' },
    { text: 'The website has useful information but is difficult to navigate.', count: 1, sentiment: 'neutral', emoji: '😐' },
    { text: 'The app frequently crashes and is hard to use.', count: 1, sentiment: 'negative', emoji: '😞' },
    { text: 'My experience with the network has been mixed.', count: 1, sentiment: 'neutral', emoji: '😐' },
    { text: 'Customer service waits are often long.', count: 1, sentiment: 'negative', emoji: '😞' }
  ];

  // Initially show all questions
  this.filterQuestionsBySentiment('all');
}

filterQuestionsBySentiment(sentiment: string) {
  if (sentiment === 'all') {
    this.questions = this.allQuestions.slice(0, 10); // Show top 10 questions
  } else {
    this.questions = this.allQuestions
      .filter(question => question.sentiment === sentiment)
      .slice(0, 10); // Limit to top 10
  }
}

// createSentimentChart() {
//   const canvas = document.getElementById('sentimentChart') as HTMLCanvasElement;
//   const ctx = canvas.getContext('2d');

//   this.sentimentChart = new Chart(ctx, {
//     type: 'doughnut',
//     data: {
//       labels: ['Positive', 'Neutral', 'Negative'],
//       datasets: [{
//         data: [60, 30, 10],
//         backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
//       }]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         tooltip: { enabled: true }
//       },
//       onClick: (event: ChartEvent, activeElements: any[]) => {
//         if (activeElements.length > 0) {
//           const activeIndex = activeElements[0].index;
//           const sentiment = this.sentimentChart.data.labels[activeIndex];
//           this.filterQuestionsBySentiment((sentiment as string).toLowerCase());
//         }
//       }
//     }
//   });

//   // Add event listener for clicking outside the chart
//   document.addEventListener('click', (event: MouseEvent) => {
//     const chartArea = canvas.getBoundingClientRect();
//     if (
//       event.clientX < chartArea.left ||
//       event.clientX > chartArea.right ||
//       event.clientY < chartArea.top ||
//       event.clientY > chartArea.bottom
//     ) {
//       this.filterQuestionsBySentiment('all'); // Load all questions when clicking outside
//     }
//   });
// }

downloadKeywords(flag: string) {
  let transformedData;

  if (flag === 'positive' || flag === 'negative' || flag === 'neutral') {
    // Only return the keyword and count columns
    transformedData = this.allQuestions
      .filter((question) => question.sentiment === flag)
      .map((question) => ({
        FAQ: question.text,
        count: question.count
      }));
  } else {
    // Include positive, negative, and neutral columns for "Top Keywords"
    transformedData = this.allQuestions.map((question) => ({
      FAQ: question.text,
      count: question.count,
      positive: question.sentiment === 'positive' ? '✓' : '',
      negative: question.sentiment === 'negative' ? '✓' : '',
      neutral: question.sentiment === 'neutral' ? '✓' : ''
    }));
  }

  // Export the filtered data to Excel
  this.excelService.exportAsExcelFile(transformedData, flag + 'Keywords');
}

createSentimentChart() {
  const canvas = document.getElementById('sentimentChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  this.sentimentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [60, 30, 10],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      onClick: (event: ChartEvent, activeElements: any[]) => {
        if (activeElements.length > 0) {
          const activeIndex = activeElements[0].index;
          this.selectedSentiment = (this.sentimentChart.data.labels[activeIndex] as string).toLowerCase();
          this.filterQuestionsBySentiment(this.selectedSentiment);
      
          // Show the modal
          const modal = new bootstrap.Modal(document.getElementById('faqModal'));
          console.log("aa");
          
          modal.show();
        }
      }
      
      
    }
  });

  // Add event listener for clicking outside the chart
  document.addEventListener('click', (event: MouseEvent) => {
    const chartArea = canvas.getBoundingClientRect();
    if (
      event.clientX < chartArea.left ||
      event.clientX > chartArea.right ||
      event.clientY < chartArea.top ||
      event.clientY > chartArea.bottom
    ) {
      this.filterQuestionsBySentiment('all'); // Load all questions when clicking outside
    }
  });
}
  

  loadTransferRatioData() {
    // Dynamically load the transfer ratio table data
    this.transferData = [
      { keyword: 'Plan', negativeWord: 3, noAnswer: 0 },
      { keyword: 'Charge', negativeWord: 6, noAnswer: 0 },
      {keyword: 'Speed', negativeWord: 0, noAnswer: 4 },
    ];
  }

 

  openModal(event: MouseEvent) {
    event.preventDefault();
    
    const modalElement = document.getElementById('transferRatioModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  
  closeModal() {
    const modalElement = document.getElementById('transferRatioModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement); // Get the modal instance
      if (modal) {
        modal.hide(); // Hide the modal
        modal.dispose(); // Dispose of the modal instance
      }
    }
  
    // Ensure the 'modal-open' class is removed from the body
    document.body.classList.remove('modal-open');
  
    // Restore the overflow (scrollbar) just in case
    document.body.style.overflow = 'auto';
  
    // Remove any lingering modal-backdrop that might be blocking interactions
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach((backdrop) => {
      backdrop.remove(); // Remove any remaining backdrops
    });
  
    // Ensure that other modals or interactive elements can be clicked by removing any overlaying styles
    document.body.style.pointerEvents = 'auto'; // Restore clickability
  }
  
  
  


 


  createLineChart() {
    const canvas = document.getElementById("chartHours") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    this.chartHours = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        datasets: [
          {
            borderColor: "#6bd098",
            backgroundColor: "#6bd098",
            borderWidth: 3,
            data: [300, 310, 316, 322, 330, 326, 333, 345, 338, 354],
            fill: false,
          },
          {
            borderColor: "#f17e5d",
            backgroundColor: "#f17e5d",
            borderWidth: 3,
            data: [320, 340, 365, 360, 370, 385, 390, 384, 408, 420],
            fill: false,
          },
          {
            borderColor: "#fcc468",
            backgroundColor: "#fcc468",
            borderWidth: 3,
            data: [370, 394, 415, 409, 425, 445, 460, 450, 478, 484],
            fill: false,
          },
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false
          },
        },
        scales: {
          y: {
            ticks: {
              color: "#9f9f9f",
            },
            grid: {
              color: 'rgba(255,255,255,0.05)',
            }
          },
          x: {
            grid: {
              color: 'rgba(255,255,255,0.1)',
              display: false,
            },
            ticks: {
              padding: 20,
              color: "#9f9f9f"
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  // createPieChart() {
  //   const canvas = document.getElementById("chartEmail") as HTMLCanvasElement;
  //   const ctx = canvas.getContext("2d");

  //   this.chartEmail = new Chart(ctx, {
  //     type: 'pie',
  //     data: {
  //       labels: [1, 2, 3],
  //       datasets: [{
  //         label: "Emails",
  //         backgroundColor: [
  //           '#e3e3e3',
  //           '#4acccd',
  //           '#fcc468',
  //           '#ef8157'
  //         ],
  //         borderWidth: 0,
  //         data: [342, 480, 530]
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: {
  //           display: false,
  //         },
  //         tooltip: {
  //           enabled: false
  //         },
  //       },
  //       responsive: true,
  //       maintainAspectRatio: false,
  //     }
  //   });
  // }

  createDoughnutChart() {
    const canvas = document.getElementById('fileStatusChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    this.fileStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Processed', 'Pending', 'Invalid'],
        datasets: [{
          data: [55, 33, 12],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // createPeakHourChart() {
  //   const canvas = document.getElementById("peakHourChart") as HTMLCanvasElement;
  //   const ctx = canvas.getContext("2d");

  //   this.peakHourChart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: ["12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM","12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM"],
  //       datasets: [{
  //         label: "Peak hour calls",
  //         backgroundColor: '#4acccd',
  //         borderColor: '#4acccd',
  //         data: [30, 75, 40, 150, 20, 200, 1000, 30, 30, 40, 50, 60, 70, 20, 50, 100, 10, 30, 40, 50, 50, 60, 70, 75],
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: {
  //           display: true
  //         },
  //         tooltip: {
  //           enabled: true
  //         }
  //       },
  //       scales: {
  //         y: {
  //           ticks: {
  //             color: "#9f9f9f"
  //           },
  //           grid: {
  //             color: 'rgba(255,255,255,0.05)',
  //           },
  //           beginAtZero: true
  //         },
  //         x: {
  //           grid: {
  //             color: 'rgba(255,255,255,0.1)',
  //             display: false,
  //           },
  //           ticks: {
  //             padding: 20,
  //             color: "#9f9f9f"
  //           }
  //         }
  //       },
  //       responsive: true,
  //       maintainAspectRatio: false,
  //     }
  //   });
  // }

  createPeakHourChart() {
    const canvas = document.getElementById("peakHourChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
  
    this.peakHourChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM"],
        datasets: [{
          label: "Peak hour calls",
          backgroundColor: '#4acccd',
          borderColor: '#4acccd',
          data: [30, 75, 40, 150, 20, 200, 1000, 30, 30, 40, 50, 60, 70, 20, 50, 100, 10, 30, 40, 50, 50, 60, 70, 75],
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            ticks: {
              color: "#9f9f9f"
            },
            grid: {
              color: 'rgba(255,255,255,0.05)',
            },
            beginAtZero: true
          },
          x: {
            grid: {
              color: 'rgba(255,255,255,0.1)',
              display: false,
            },
            ticks: {
              padding: 20,
              color: "#9f9f9f"
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        onClick: (e: ChartEvent) => {
          const event = e.native as unknown as Event;  // Type casting
          const activePoints = this.peakHourChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
  
          if (activePoints.length > 0) {
            const index = activePoints[0].index;
            const value = this.peakHourChart.data.datasets[0].data[index];
  
            // Check if clicked on the specific bar with 1000 value
            if (value === 1000) {
              this.showLineChartModal();  // Open modal to show line chart for last 3 days
            }
          }
        }
      }
    });
  }
  
  showLineChartModal() {
    // Open the modal
    const modalElement = document.getElementById('lineChartModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  
    // Create a gradient for the line chart
    const lineCanvas = document.getElementById("lineChart") as HTMLCanvasElement;
    const lineCtx = lineCanvas.getContext("2d");
  
    const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75,192,192,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
    // Create a new line chart with improved UI
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['06:10 PM', '06:30 PM', '06:50 PM'],  // Last 3 days
        datasets: [{
          label: 'Peak Calls Over Last 60 Minutes',
          backgroundColor: gradient,  // Gradient fill for the area under the line
          borderColor: 'rgba(75,192,192,1)',  // Line color
          pointBackgroundColor: 'rgba(255,99,132,1)',  // Point color
          pointBorderColor: '#fff',  // Point border
          pointRadius: 6,  // Size of the data point
          pointHoverRadius: 8,  // Larger radius on hover
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',  // Hover point color
          pointHoverBorderColor: '#fff',
          borderWidth: 3,  // Thicker line
          fill: true,  // Fill the area under the line
          tension: 0.4,  // Smooth curves between points
          data: [1200, 1400, 400],  // Example data for last 3 days
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#9f9f9f",  // Custom label color
              font: {
                size: 14  // Font size for labels
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#f5f5f5',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
            callbacks: {
              label: function(tooltipItem) {
                return `Calls: ${tooltipItem.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255,255,255,0.1)',  // Custom grid color
            },
            ticks: {
              color: "#9f9f9f",
              font: {
                size: 12  // Font size for y-axis labels
              }
            }
          },
          x: {
            grid: {
              display: false,  // Hide grid for x-axis
            },
            ticks: {
              color: "#9f9f9f",
              font: {
                size: 12  // Font size for x-axis labels
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  
}
