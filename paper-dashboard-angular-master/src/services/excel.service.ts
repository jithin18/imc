import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";

@Injectable({
  providedIn: "root",
})
export class ExcelService {
  constructor() {}

  public exportAsExcelFile(
    jsonData: any[],
    excelFileName: string,
    sheetNames?: string[]
  ): void {
    sheetNames = sheetNames && sheetNames.length > 0 ? sheetNames : ["Sheet1"];
    // console.log('jsonData',jsonData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Sheet1: worksheet },
      SheetNames: sheetNames,
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  downloadFile(data: any, excelFileName: string) {
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    const csvArray = csv.join("\r\n");

    const a = document.createElement("a");
    const blob = new Blob([csvArray], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = excelFileName + ".csv";
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public exportAsExcelFile_download(
    jsonData: any[],
    excelFileName: string,
    sheetNames?: string[]
  ): void {
    sheetNames = sheetNames && sheetNames.length > 0 ? sheetNames : ["Sheet1"];
    ///console.log('1');
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Sheet1: worksheet },
      SheetNames: sheetNames,
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const a = document.createElement("a");
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const url = window.URL.createObjectURL(data);

    a.href = url;
    a.download = excelFileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}
