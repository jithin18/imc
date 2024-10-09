import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class OngoingCalldtlsService {
  rootURL = "api/";
  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };
  constructor(private http: HttpClient) {}

  getagentcalls(callid) {
    return this.http.post(
      `${this.rootURL}reports/getbotchat`, // Ensure proper use of template literals
      { callId: callid },
      this.httpOptions
    );
  }

  getlivecalls() {
    return this.http.post(
      `${this.rootURL}reports/getongoingcalldetails`, // Ensure proper use of template literals
      {},
      this.httpOptions
    );
  }

  getcallhistory(formattedjson) {
    return this.http.post(
      `${this.rootURL}reports/getcallhistory`, 
      formattedjson,
      this.httpOptions
    );
  }
}
