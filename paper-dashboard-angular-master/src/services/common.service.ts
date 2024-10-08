import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, Subject } from "rxjs";
@Injectable({
    providedIn: 'root'
  })
  export class commonservice{
    rootURL = "api/";
    httpOptions = {
        headers: new HttpHeaders({ "Content-Type": "application/json" }),
      };
      constructor(private http: HttpClient) {}

      getagentcalls(daterange) {
        console.log(daterange, "daterangexx");	
        return this.http.post(
          `${this.rootURL}dashboard/getagentcalls`, // Ensure proper use of template literals
          daterange,
          this.httpOptions
        );
      }
  }