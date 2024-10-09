
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
  botAccuracy: string = '0%'; // Initialize the bot accuracy value
  responseTime: string = '0'; // Initialize the response time value
  avgsentimentscore: string = '0';
  agentTransferRatio: string = '0%'; 
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
console.log(this.selectedTimePeriod, "this.selectedTimePeriod");

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
  this.commonservice.getagentcalls(this.dateRange).subscribe((data: any) => {
    console.log(data, "data");
    if (data.status === 200) {
      const vJsonOut = JSON.parse(data.data.v_json_out);
      this.totalCalls = vJsonOut.total_calls;  // Total number of calls
      this.callDuration = vJsonOut.duration;   // Format duration to hours and minutes
      this.avgCallHandlingTime = vJsonOut.avg_hndl_time;  // Format avg handling time to hh:mm:ss

      // Process the ref_cur_out to plot the graph
      const refCurOut = data.data.ref_cur_out;

      // Call the method to update the chart with the new data
      this.updatePeakHourChart(refCurOut);
    }
  });

  this.loadSentimentData();
  this.getBotAccuracy();
  //this.getbotkeywords();
  this.loadTransferRatioData();
}

// Function to create and initialize the chart


// Function to update the chart with new data from ref_cur_out
updatePeakHourChart(refCurOut: any[]) {
  // Initialize the data array with zeros for all 24 hours
  const peakHourData = new Array(24).fill(0);

  // Loop through refCurOut and populate the peakHourData array based on the hour (date)
  refCurOut.forEach((entry) => {
    const hour = parseInt(entry.date); // The 'date' in your ref_cur_out seems to represent the hour
    const totalCalls = entry.total_calls;

    // Map the hour (from 00 to 23) to the corresponding index in the labels
    const index = this.peakHourChart.data.labels.findIndex((label: string) => parseInt(label) === hour);
    
    if (index !== -1) {
      peakHourData[index] = totalCalls;
    }
  });

  // Update the chart's data and re-render it
  this.peakHourChart.data.datasets[0].data = peakHourData;
  this.peakHourChart.update();
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
  console.log(this.dateRange, "dateRange11");
  
  this.commonservice.getqueryanalysis(this.dateRange).subscribe((data: any) => {
    console.log(data, "Sentiment API Data");

    if (data.status === 200) {
      const sentimentData = data.data.ref_cur_out[0]; // Accessing the first object in ref_cur_out array
      
      // Extract positive, negative, and neutral counts
      const positive = sentimentData.positive || 0;
      const negative = sentimentData.negative || 0;
      const neutral = sentimentData.neutral || 0;

      // Calculate total count
      const total = positive + negative + neutral;

      // Calculate chart data percentages
      const chartData = total > 0
        ? [(positive / total) * 100, (neutral / total) * 100, (negative / total) * 100]
        : [100, 0, 0];  // Fallback to all positive if the total is 0 (unlikely but a safe guard)

      // Update the chart data and refresh the chart
      this.sentimentChart.data.datasets[0].data = chartData;
      this.sentimentChart.update();
    }
  });
}
getBotAccuracy() {
  console.log(this.dateRange, "dateRange11");
  
  this.commonservice.getbotsummary(this.dateRange).subscribe((data: any) => {
    console.log(data, "Sentiment API Data");

    if (data.status === 200) {
      const response = JSON.parse(data.data.v_json_out); // Parse the JSON string
      
      // Assign the values from the response
      this.botAccuracy = response.bot_accuracy ? `${response.bot_accuracy}%` : '0%';
   
      
      this.responseTime = response.resp_time.toString(); // Convert to string
    
      
      this.agentTransferRatio = response.agent_trnsfr_ratio ? `${response.agent_trnsfr_ratio}%` : '0%';
    this.avgsentimentscore  =response.sentiment_score.toString();
      
      console.log(this.botAccuracy, this.responseTime, this.agentTransferRatio);
    }
  });
}
getbotkeywords() {
console.log(this.dateRange,"daterane");

  this.commonservice.getkeywords(this.dateRange).subscribe((data: any) => {
    console.log(data, " Data Keywords");

    if (data.status === 200) {
      console.log(data, "Data keywords");
      
    }
  });
}

loadFAQData() {
  let sentimentType;
  switch (this.selectedSentiment) {
    case 'positive':
      sentimentType = 1;
      break;
    case 'negative':
      sentimentType = -1;
      break;
    case 'neutral':
      sentimentType = 0;
      break;
    default:
      sentimentType = 1;  // Default to positive if undefined
  }

  // Prepare the payload for the API
  const payload = {
    from_date: this.dateRange.from_date,
    to_date: this.dateRange.to_date,
    type: sentimentType  // Send the selected sentiment type
  };

  console.log(payload, "Payload for API call");

  this.commonservice.getfaq(payload).subscribe((data: any) => {
    console.log(data, "FAQ API Data");

    if (data.status === 200 && data.data && data.data.v_json_out) {
      try {
        const faqs = JSON.parse(data.data.v_json_out) || [];

        // Ensure that `faqs` is an array
        if (Array.isArray(faqs)) {
          this.allQuestions = faqs.map(faq => ({
            text: faq.question,
             // Set count as 0 if it's missing
            sentiment: this.selectedSentiment as 'positive' | 'negative' | 'neutral',  // Explicitly cast the sentiment
            emoji: this.getSentimentEmoji(this.selectedSentiment as 'positive' | 'negative' | 'neutral')
          }));

          // Filter questions based on the selected sentiment
          this.filterQuestionsBySentiment(this.selectedSentiment);
          
          // Show the modal
          const modal = new bootstrap.Modal(document.getElementById('faqModal'));
          modal.show();
        } else {
          console.error("FAQ data is not an array.");
        }
      } catch (error) {
        console.error("Error parsing v_json_out:", error);
      }
    }
  });
}


downloadKeywords(flag: string) {
  const payload = {
    from_date: this.dateRange.from_date,
    to_date: this.dateRange.to_date,
    type: flag === 'positive' ? 1 : flag === 'negative' ? -1 : 0 // Use sentiment types for payload
  };

  this.commonservice.getfaq(payload).subscribe((data: any) => {
    if (data.status === 200 && data.data && data.data.v_json_out) {
      try {
        const vJsonOut = JSON.parse(data.data.v_json_out);

        // Ensure vJsonOut is an array before mapping
        if (Array.isArray(vJsonOut)) {
          const apiQuestions = vJsonOut.map((item: any) => ({
            text: item.question,
           
            sentiment: flag  // Use the flag to set sentiment type
          }));

          let transformedData;

          if (['positive', 'negative', 'neutral'].includes(flag)) {
            // Filter by sentiment and prepare for Excel export
            transformedData = apiQuestions
              .filter((question) => question.sentiment === flag)
              .map((question) => ({
                FAQ: question.text
                
              }));
          } else {
            // Include sentiment flags for all questions
            transformedData = apiQuestions.map((question) => ({
              FAQ: question.text,
              
              positive: question.sentiment === 'positive' ? '✓' : '',
              negative: question.sentiment === 'negative' ? '✓' : '',
              neutral: question.sentiment === 'neutral' ? '✓' : ''
            }));
          }

          // Export the filtered data to Excel
          this.excelService.exportAsExcelFile(transformedData, flag + 'Keywords');
        } else {
          console.error("v_json_out is not an array.");
        }
      } catch (error) {
        console.error("Error parsing v_json_out:", error);
      }
    }
  });
}

getSentimentEmoji(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return '😊';
    case 'neutral':
      return '😐';
    case 'negative':
      return '😞';
    default:
      return '';
  }
}

filterQuestionsBySentiment(sentiment: string) {
  if (sentiment === 'all') {
    this.questions = this.allQuestions.slice(0, 10); // Show top 10 questions
  } else {
    this.questions = this.allQuestions
      .filter(question => question.sentiment === sentiment)
      .slice(0, 10); // Limit to top 10 questions
  }
}


createSentimentChart() {
  console.log("a1");
  
  const canvas = document.getElementById('sentimentChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  this.sentimentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],  // Order matters for matching index
      datasets: [{
        data: [0, 0, 0],  // Initial placeholder data
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],  // Green for positive, yellow for neutral, red for negative
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

          // Map the index to sentiment labels
          switch (activeIndex) {
            case 0:
              this.selectedSentiment = 'positive';
              break;
            case 1:
              this.selectedSentiment = 'neutral';
              break;
            case 2:
              this.selectedSentiment = 'negative';
              break;
            default:
              this.selectedSentiment = 'positive';  // Default to positive if something goes wrong
          }

          // Load FAQ data based on the selected sentiment
          this.loadFAQData();  
        }
      }
    }
  });
  
  // Fetch and update chart data from the API
  this.loadSentimentData();
}

  

loadTransferRatioData() {
  console.log(this.dateRange, "daterange");

  this.commonservice.getkeywords(this.dateRange).subscribe((data: any) => {
      console.log(data, "Data Keywords");

      if (data.status === 200) {
          console.log(data, "Data keywords");

          // Map the API response to the transferData structure
          this.transferData = data.data.ref_cur.map((item: any) => ({
              keyword: item.KEYWORD, // Map KEYWORD from the response
              negativeWord: item.NEGATIVE, // Map NEGATIVE from the response
              noAnswer: item.NEUTRAL // Map NEUTRAL from the response (you may need to adjust this based on your requirements)
          }));
          
          console.log(this.transferData, "Formatted Transfer Data");
      }
  });
}

// loadTransferRatioData() {
//   Dynamically load the transfer ratio table data
//   this.transferData = [
//     { keyword: 'Plan', negativeWord: 3, noAnswer: 0 },
//     { keyword: 'Charge', negativeWord: 6, noAnswer: 0 },
//     {keyword: 'Speed', negativeWord: 0, noAnswer: 4 },
//   ];
// }
 

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

  // createPeakHourChart() {
  //   const canvas = document.getElementById("peakHourChart") as HTMLCanvasElement;
  //   const ctx = canvas.getContext("2d");
  
  //   this.peakHourChart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"],
  //       datasets: [{
  //         label: "Peak hour calls",
  //         backgroundColor: '#4acccd',
  //         borderColor: '#4acccd',
  //         data: new Array(24).fill(0), // Initial empty data for 24 hours
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: {
  //           display: false
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
  //       onClick: (e: ChartEvent) => {
  //         const event = e.native as unknown as Event;  // Type casting
  //         const activePoints = this.peakHourChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
  //          console.log(activePoints, "activePoints");
           
  //         if (activePoints.length > 0) {
  //           const index = activePoints[0].index;
  //           const value = this.peakHourChart.data.datasets[0].data[index];
  //           console.log(value, "value");
  //           console.log(index, "index");
            
  //           // Check if clicked on the specific bar with 1000 value
  //           if (value === 2) {
  //             this.showLineChartModal();  // Open modal to show line chart for last 3 days
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
  // showLineChartModal() {

  //   this.commonservice.getbarchart(this.dateRange).subscribe((data: any) => {
  //     console.log(data, "dataline");
  //     if (data.status === 200) {
  //        // Format avg handling time to hh:mm:ss
  //      console.log(data, "dataline2");
   
  //       // Process the ref_cur_out to plot the graph
  //       const refCurOut = data.data.ref_cur_out;
  
  //       // Call the method to update the chart with the new data
       
  //     }
  //   });
  //   // Open the modal
  //   const modalElement = document.getElementById('lineChartModal');
  //   const modal = new bootstrap.Modal(modalElement);
  //   modal.show();
  
  //   // Create a gradient for the line chart
  //   const lineCanvas = document.getElementById("lineChart") as HTMLCanvasElement;
  //   const lineCtx = lineCanvas.getContext("2d");
  
  //   const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
  //   gradient.addColorStop(0, 'rgba(75,192,192,0.4)');
  //   gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  //   // Create a new line chart with improved UI
  //   new Chart(lineCtx, {
  //     type: 'line',
  //     data: {
  //       labels: ['10:10 AM', '10:20 AM'],  // Last 3 days
  //       datasets: [{
  //         label: 'Peak Calls Over Last 60 Minutes',
  //         backgroundColor: gradient,  // Gradient fill for the area under the line
  //         borderColor: 'rgba(75,192,192,1)',  // Line color
  //         pointBackgroundColor: 'rgba(255,99,132,1)',  // Point color
  //         pointBorderColor: '#fff',  // Point border
  //         pointRadius: 6,  // Size of the data point
  //         pointHoverRadius: 8,  // Larger radius on hover
  //         pointHoverBackgroundColor: 'rgba(75,192,192,1)',  // Hover point color
  //         pointHoverBorderColor: '#fff',
  //         borderWidth: 3,  // Thicker line
  //         fill: true,  // Fill the area under the line
  //         tension: 0.4,  // Smooth curves between points
  //         data: [1, 1],  // Example data for last 3 days
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: {
  //           display: true,
  //           labels: {
  //             color: "#9f9f9f",  // Custom label color
  //             font: {
  //               size: 14  // Font size for labels
  //             }
  //           }
  //         },
  //         tooltip: {
  //           enabled: true,
  //           backgroundColor: '#f5f5f5',
  //           titleColor: '#333',
  //           bodyColor: '#666',
  //           borderColor: 'rgba(75,192,192,1)',
  //           borderWidth: 1,
  //           callbacks: {
  //             label: function(tooltipItem) {
  //               return `Calls: ${tooltipItem.raw}`;
  //             }
  //           }
  //         }
  //       },
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //           grid: {
  //             color: 'rgba(255,255,255,0.1)',  // Custom grid color
  //           },
  //           ticks: {
  //             color: "#9f9f9f",
  //             font: {
  //               size: 12  // Font size for y-axis labels
  //             }
  //           }
  //         },
  //         x: {
  //           grid: {
  //             display: false,  // Hide grid for x-axis
  //           },
  //           ticks: {
  //             color: "#9f9f9f",
  //             font: {
  //               size: 12  // Font size for x-axis labels
  //             }
  //           }
  //         }
  //       },
  //       responsive: true,
  //       maintainAspectRatio: false
  //     }
  //   });

  // }
  createPeakHourChart() {
    const canvas = document.getElementById("peakHourChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
  
    this.peakHourChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"],
        datasets: [{
          label: "Peak hour calls",
          backgroundColor: '#4acccd',
          borderColor: '#4acccd',
          data: new Array(24).fill(0), // Initial empty data for 24 hours
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
            const clickedHour = this.peakHourChart.data.labels[index] as string; // Get the clicked hour
  
            console.log(value, "value");
            console.log(index, "index");
            console.log(clickedHour, "clicked hour");
  
            // If value is greater than 0, show the modal and pass the clicked hour
            if (value > 0) {
              this.showLineChartModal(clickedHour);  // Pass the clicked hour to the modal function
            }
          }
        }
      }
    });
  }
  // showLineChartModal(clickedHour: string) {
  //   const payload = {
  //     from_date: this.dateRange.from_date,  
  //     to_date: this.dateRange.to_date,      
  //     //hour: clickedHour               
  //   };
  
  //   console.log(payload, "Payload for API call");
  
  //   // Call the API with the payload
  //   this.commonservice.getbarchart(payload).subscribe((data: any) => {
  //     console.log(data, "Data from API");
  
  //     if (data.status === 200) {
  //       // Handle the data and update the line chart accordingly
  //       const refCurOut = data.data.ref_cur_out;
  //       console.log(refCurOut, "Processed data for the line chart");
  
  //       // Process the ref_cur_out to update the line chart
  //     }
  //   });
  
  //   // Open the modal
  //   const modalElement = document.getElementById('lineChartModal');
  //   const modal = new bootstrap.Modal(modalElement);
  //   modal.show();
  
  //   // Create a gradient for the line chart
  //   const lineCanvas = document.getElementById("lineChart") as HTMLCanvasElement;
  //   const lineCtx = lineCanvas.getContext("2d");
  
  //   const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
  //   gradient.addColorStop(0, 'rgba(75,192,192,0.4)');
  //   gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  //   // Create a new line chart with improved UI
  //   new Chart(lineCtx, {
  //     type: 'line',
  //     data: {
  //       labels: ['10:10 AM', '10:20 AM'],  // Example data, replace with actual data
  //       datasets: [{
  //         label: 'Peak Calls Over Last 60 Minutes',
  //         backgroundColor: gradient,
  //         borderColor: 'rgba(75,192,192,1)',
  //         pointBackgroundColor: 'rgba(255,99,132,1)',
  //         pointBorderColor: '#fff',
  //         pointRadius: 6,
  //         pointHoverRadius: 8,
  //         pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  //         pointHoverBorderColor: '#fff',
  //         borderWidth: 3,
  //         fill: true,
  //         tension: 0.4,
  //         data: [1, 1],  // Example data, replace with actual data
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: {
  //           display: true,
  //           labels: {
  //             color: "#9f9f9f",
  //             font: {
  //               size: 14
  //             }
  //           }
  //         },
  //         tooltip: {
  //           enabled: true,
  //           backgroundColor: '#f5f5f5',
  //           titleColor: '#333',
  //           bodyColor: '#666',
  //           borderColor: 'rgba(75,192,192,1)',
  //           borderWidth: 1,
  //           callbacks: {
  //             label: function(tooltipItem) {
  //               return `Calls: ${tooltipItem.raw}`;
  //             }
  //           }
  //         }
  //       },
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //           grid: {
  //             color: 'rgba(255,255,255,0.1)',
  //           },
  //           ticks: {
  //             color: "#9f9f9f",
  //             font: {
  //               size: 12
  //             }
  //           }
  //         },
  //         x: {
  //           grid: {
  //             display: false,
  //           },
  //           ticks: {
  //             color: "#9f9f9f",
  //             font: {
  //               size: 12
  //             }
  //           }
  //         }
  //       },
  //       responsive: true,
  //       maintainAspectRatio: false
  //     }
  //   });
  // }

  showLineChartModal(clickedHour: string) {
    const payload = {
        from_date: this.dateRange.from_date,
        to_date: this.dateRange.to_date,
        hour: clickedHour
    };

    console.log(payload, "Payload for API call");

    // Call the API with the payload
    this.commonservice.getbarchart(payload).subscribe((data: any) => {
        console.log(data, "Data from API");

        if (data.status === 200) {
            let refCurOut = data.data.ref_cur_out;

            console.log(refCurOut, "Processed data for the line chart");

            // Sort the array by date in ascending order
            refCurOut.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Apply the condition only if there are more than 5 entries
            if (refCurOut.length > 5) {
                // Sort the array by total_calls in descending order
                refCurOut.sort((a, b) => b.total_calls - a.total_calls);
                // Take the top 5 entries based on total_calls
                refCurOut = refCurOut.slice(0, 5);
            }

            // After taking the top 5, sort the remaining entries again by date in ascending order
            refCurOut.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Process the refCurOut to update the line chart
            const labels: string[] = refCurOut.map((item: any) => {
                const [day, month, yearAndHour] = item.date.split('-');
                const [year, hour] = yearAndHour.split(' ');
                const formattedDate = new Date(`${year}-${month}-${day}T${hour}:00:00Z`);

                // Extract hours and minutes
                const hours = formattedDate.getUTCHours().toString().padStart(2, '0');
                const minutes = '00';  // Since you only have hours, minutes are set to '00'
                
                return `${hours}:${minutes}`;  // Return formatted time as HH:MM
            });

            console.log(labels, "labels");

            const chartData: number[] = refCurOut.map((item: any) => item.total_calls);
            console.log(chartData, "chartData");

            // Update the line chart with the new labels and data
            this.updateLineChart(labels, chartData);
        } else {
            console.error("Failed to retrieve data from the API.");
        }
    });

    // Open the modal
    const modalElement = document.getElementById('lineChartModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}


  
  
  // Create a method to update the chart
  updateLineChart(labels: string[], data: number[]) {
    const lineCanvas = document.getElementById("lineChart") as HTMLCanvasElement;
    const lineCtx = lineCanvas.getContext("2d");
  
    const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75,192,192,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: labels,  // Dynamically generated labels
        datasets: [{
          label: 'Peak Calls Over Last 60 Minutes',
          backgroundColor: gradient,
          borderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: 'rgba(255,99,132,1)',
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: '#fff',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          data: data  // Dynamically generated data
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#9f9f9f",
              font: {
                size: 14
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
              color: 'rgba(255,255,255,0.1)',
            },
            ticks: {
              color: "#9f9f9f",
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#9f9f9f",
              font: {
                size: 12
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
