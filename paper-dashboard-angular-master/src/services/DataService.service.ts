import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private productData: any;
  private dateRange: any;

  setProductData(data: any, range: any) {
    this.productData = data;
    this.dateRange = range;
  }

  getProductData() {
    return {
      dateRange: this.dateRange,
      productData: this.productData
    };
  }

  clearData() {
    this.productData = null;
    this.dateRange = null;
  }
}
