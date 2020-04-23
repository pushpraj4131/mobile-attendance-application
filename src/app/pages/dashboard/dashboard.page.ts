import { Component, OnInit, Output , Input , ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform, NavController} from '@ionic/angular';
import { LogsService } from 'src/app/services/logs.service';
import { interval, Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import * as moment from 'moment';
declare var $;
declare var require: any;
const momentDurationFormat = require('moment-duration-format');

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
	modelValue : any;
	attendanceFlag: any ; 
	userInfo ;
	filledAttendanceLog ;
	entry : any;
	exit : any ;
	fiveDaysLogs : any = [];
	subscription: Subscription;
	intervalId: any;
	loginFlag
	dates : any = [];
	getdate:any;
	olddate:any;
	olddateCom:any;
	timeOf:any;
	timeOn:any;
	diffTime:any;
	timeString:any;
	alldate = {
		dates: ""
	}


	constructor(
		private _logService: LogsService,
		private _router: Router,
		private platform: Platform,
		private _storage: Storage,
		private _nativeStorage: NativeStorage
		) { 
		this.userInfo = JSON.parse(localStorage.getItem("currentUser"));
		if(!this.userInfo){
			this._router.navigate(['/login']);
		}

		if(this.userInfo.userRole != 'admin'){
			this.getLastFiveDaysAttendance();
			this.getCurrentDateLogById();
		}
	}

	ngOnInit() {
		this.ionViewDidEnter();
		this.ionViewWillLeave();
		this.alldemo();
	}

	getCurrentDateLogById(){
		this._logService.getCurrentDateLogById().subscribe((response:any) => {
			console.log("response of getCurrentDateLogById ===>" , response);
			if(response.length){
				this.filledAttendanceLog = this.properFormatDate(response);
				console.log("the filledAttendanceLog is =======>", this.filledAttendanceLog);
				// this.filledAttendanceLog = response;

				var timeLogLength = this.filledAttendanceLog[0].timeLog.length - 1;
				console.log(timeLogLength);
				var lastRecord = this.filledAttendanceLog[0].timeLog[timeLogLength].out;
				if(lastRecord != '-'){
					this.exit = this.filledAttendanceLog[0].timeLog[timeLogLength].out; 
					this.entry = false;
					this.closedata();
				}else{
					this.entry = this.filledAttendanceLog[0].timeLog[timeLogLength].in; 
					this.exit = false;
					this.opensnack();
				}
			}	
		}, (err)=>{
			console.log("error of getCurrentDateLogById ===>" , err);
		});
	}

	fillAttendance(){
		this._logService.fillAttendance().subscribe((response:any) =>{
			console.log("response ====>" , response);

			this.filledAttendanceLog = this.properFormatDate(response);
			console.log("the filledAttendanceLog is =======>", this.filledAttendanceLog);

			this.filledAttendanceLog=this.filledAttendanceLog.reverse();  
			console.log("the filledAttendanceLog reverse is =======>", this.filledAttendanceLog);

			var flag = 0;
			if(this.fiveDaysLogs){
				console.log("IN IFFFFFFFFFFFFF =============?");
				this.fiveDaysLogs.filter((data)=>{
					console.log("IN IFFFFFFFFFFFFF =============?" , data.date == this.filledAttendanceLog[0].date);
					if(data.date == this.filledAttendanceLog[0].date){
						console.log(data.date , this.filledAttendanceLog[0].date)
						flag = 1;
					}
				});
				console.log("IN IFFFFFFFFFFFFF =============?", this.fiveDaysLogs);

			}
			if(flag == 0 && this.fiveDaysLogs){
				this.fiveDaysLogs.unshift(this.filledAttendanceLog[0]);
			}else{
				this.fiveDaysLogs[0] = this.filledAttendanceLog[0];
			}
			var timeLogLength = this.filledAttendanceLog[0].timeLog.length - 1;
			console.log(timeLogLength);
			var lastRecord = this.filledAttendanceLog[0].timeLog[timeLogLength].out;
			console.log("the last lastRecord is ====>", lastRecord);
			if(lastRecord != '-'){
				this.exit = this.filledAttendanceLog[0].timeLog[timeLogLength].out; 
				console.log("the exit of function is ====>", this.exit);
				this.entry = false;
				this.closedata();
			}else{
				this.entry = this.filledAttendanceLog[0].timeLog[timeLogLength].in;
				console.log("the entry function is ===>", this.entry); 
				this.exit = false;
				this.opensnack();
			}
		} , (err) =>{
			console.log("err ===>" , err);
		});
	}

	hmsToSeconds(s) {
		var b = s.split(':');
		return b[0]*3600 + b[1]*60 + (+b[2] || 0);
	}

	secondsToHMS(secs) {
		function z(n){return (n<10?'0':'') + n;}
		var sign = secs < 0? '-':'';
		secs = Math.abs(secs);
		return sign + z(secs/3600 |0) + ':' + z((secs%3600) / 60 |0) + ':' + z(secs%60);
	}

	alldemo(){
		var dateObj = new Date(60 * 1000); 
		var hours = dateObj.getUTCHours(); 
		var minutes = dateObj.getUTCMinutes(); 
		var seconds = dateObj.getSeconds(); 

		this.timeString = hours.toString().padStart(2, '0') 
		+ ':' + minutes.toString().padStart(2, '0') 
		+ ':' + seconds.toString().padStart(2, '0'); 

		console.log("the time string is =======>", this.timeString);
	}

	opensnack() {
		console.log("the opensnack function is called");
		this.intervalId = setInterval(() => {
			this._logService.getCurrent().subscribe((res:any) => {
				console.log("res is ngOninit", res);
			}, (err) => {
				this.olddateCom = JSON.parse(localStorage.getItem('olddate'));
				console.log("the olddateCom is ======>", this.olddateCom);

				console.log("the error ===>", err.status);
				if (err.status == 200) {
					var time = new Date();
					var hrs = time.getHours();
					var min = time.getMinutes();
					var sec = time.getSeconds();

					if (hrs > 12) {
						hrs = hrs - 12;
					}

					if (hrs == 0) {
						hrs = 12;
					}
					this.alldate.dates = document.getElementById('clock').innerHTML = hrs + ':' + min + ':' + sec;			
					console.log("the alldate", this.alldate);
					localStorage.setItem('olddate', JSON.stringify(this.alldate));

					
					
					localStorage.setItem('date', JSON.stringify(this.alldate))
					this.getdate = JSON.parse(localStorage.getItem('date'));
					console.log("the date is ===>", this.getdate);

					this.timeOf = this.olddateCom.dates;
					this.timeOn = this.getdate.dates;

					this.diffTime = this.secondsToHMS(this.hmsToSeconds(this.timeOn) - this.hmsToSeconds(this.timeOf));
					console.log("the diffTime is ====>", this.diffTime);
					console.log("the time uper is the view ====>", this.timeString);

					var datesdemo = moment().format("LTS")
					console.log("the dates demo is ====>", datesdemo);

					if (this.diffTime < this.timeString) {
						console.log("the diffTime condition is true");
					}
					else {
						this.fillAttendance();
						console.log("the diffTime condition is false");
					}
					
					
					this.olddate = this.dates[this.dates.length - 1];
					console.log("the old date is ====>", this.olddate);
					this.dates.push(this.getdate);
					console.log("the dates is ===>", this.dates);  
					var dateobj = new Date(); 
					var B = dateobj.toISOString(); 
					console.log("the dTE OBJ IS ====>", B);
				}
			})		
		}, 10000);
		console.log("the interval id is ====>", this.intervalId);
	}



	closedata(){
		console.log("the closedata function is called");
		localStorage.removeItem("date");
		clearInterval(this.intervalId);
	}

	getLastFiveDaysAttendance(){
		var id = 0;
		this._logService.getLastFiveDaysAttendance(id).subscribe((response:any) => {
			console.log("last five days response" , response);
			if(response.message != 'No logs found'){
				this.fiveDaysLogs = this.properFormatDate(response.foundLogs);
				this.fiveDaysLogs = this.fiveDaysLogs.reverse();  
			}
		} ,(err) => {
			console.log("last five days error" , err);
		});
	}

	properFormatDate(data){
		return data = data.filter((obj)=>{
			return obj.date = moment(obj.date).utc().format("DD/MM/YYYY");

		});
	}

	ionViewDidEnter(){
		this.subscription = this.platform.backButton.subscribe(()=>{
			navigator['app'].exitApp();
		});
	}

	ionViewWillLeave(){
		this.subscription.unsubscribe();
	}
}
