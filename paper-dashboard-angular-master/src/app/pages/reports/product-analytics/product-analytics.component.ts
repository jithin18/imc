import { Component, OnInit } from '@angular/core';
import { DataService } from 'services/DataService.service';
import { commonservice } from 'services/common.service';
import { ExcelService } from 'services/excel.service';

@Component({
  selector: 'app-product-analytics',
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.scss']
})
export class ProductAnalyticsComponent implements OnInit {
  dateRange: any;
  productData: any;
  displayedColumns: string[] = ['keyword', 'percentage','downloadExcel']; // Define columns for table
  refCurData: Array<{ KEYWORD: string, PERCENTAGE: string }> = []; // Holds ref_cur data

  // For Popup
  showPopup: boolean = false;
  callDetails: Array<{ CallID: string, Dni: string, Cli: string, ConnectTime: string, EndTime: string, Ranked_Queries: string[] }> = [];
  selectedProduct: string = '';
  
  // Pagination properties
 

  constructor(private dataService: DataService, private commonservice: commonservice,private excelService: ExcelService) {}

  ngOnInit(): void {
    const data = this.dataService.getProductData();
    if (data) {
      this.dateRange = data.dateRange;
      this.productData = data.productData;

      console.log(this.dateRange, "daterane");
      console.log(this.productData, "productData");

      if (this.productData && this.productData.data && this.productData.data.ref_cur) {
        this.refCurData = this.productData.data.ref_cur; // Assign ref_cur data
      } else {
        console.error('No ref_cur data found in productData');
      }
    } else {
      console.error('No data found in DataService');
    }
  }

showDetailedProduct(keyword: string): void {
  const payload = {
    from_date: this.dateRange.from_date,
    to_date: this.dateRange.to_date,
    product: keyword
  };
  
  console.log(payload, "payload");

  this.commonservice.gettopproduct(payload).subscribe(
    (response: any) => {
     

      if (response.status === 200 && response.data && response.data.ref_cur) {
        // Format Ranked_Queries by replacing newline characters with commas
        this.callDetails = response.data.ref_cur.map((item: any) => {
          return {
            ...item,
            Ranked_Queries: item.RANKED_QUERIES.replace(/\n/g, ', ') // Replace newline with commas
          };
        });
       console.log(this.callDetails,"calldetails");
       
        this.selectedProduct = keyword;
        this.showPopup = true;
      } else {
        console.error('No ref_cur data found in the response');
      }
    },
    (error) => {
      console.error('Error fetching product details:', error);
    }
  );
}

downloadPopupDataAsExcel(): void {
  const flag = 'Call Details for ' + this.selectedProduct;
  this.excelService.exportAsExcelFile(this.callDetails, flag);
}

showDetailedProduct1(keyword: string): void {
  const payload = {
    from_date: this.dateRange.from_date,
    to_date: this.dateRange.to_date,
    product: keyword
  };

  console.log(payload, "payload");

  this.commonservice.gettopproduct(payload).subscribe(
    (response: any) => {
      console.log(response, "datatopkey");

      if (response.status === 200 && response.data && response.data.ref_cur) {
        // Format Ranked_Queries by replacing newline characters with commas
        this.callDetails = response.data.ref_cur.map((item: any) => {
          return {
            ...item,
            Ranked_Queries: item.RANKED_QUERIES.replace(/\n/g, ', ') // Replace newline with commas
          };
        });

        // Define the flag or use a meaningful value based on the keyword
        const flag = 'Top Queries based on '; // Replace with actual flag if needed
        this.excelService.exportAsExcelFile(this.callDetails, flag + keyword);
      } else {
        console.error('No ref_cur data found in the response');
      }
    },
    (error) => {
      console.error('Error fetching product details:', error);
    }
  );
}


 
  

  // Function to close the popup
  closePopup(): void {
    this.showPopup = false;
  }
}
