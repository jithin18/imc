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
        
        return this.http.post(
          `${this.rootURL}dashboard/getagentcalls`, 
          daterange,
          this.httpOptions
        );
      }

      getbarchart(formattedjson){
        return this.http.post(
          `${this.rootURL}dashboard/getpeakhourcallbarchart`, 
          formattedjson,
          this.httpOptions
        );
      }

      getfaq(formattedjson){
        return this.http.post(
          `${this.rootURL}dashboard/getfaq`, 
          formattedjson,
          this.httpOptions
        );
      }
      getqueryanalysis(formattedjson){
        return this.http.post(
          `${this.rootURL}dashboard/getqueryanalysis`, 
          formattedjson,
          this.httpOptions
        );
      }
      getbotsummary(formattedjson){
        return this.http.post(
          `${this.rootURL}dashboard/getbotsummary`, 
          formattedjson,
          this.httpOptions
        );
      }
      getkeywords(formattedjson){
        return this.http.post(
          `${this.rootURL}dashboard/getkeywords`, 
          formattedjson,
          this.httpOptions
        );
      }
      
  }