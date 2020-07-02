import { Component, OnInit, Input } from '@angular/core';
import { Platform, IonRouterOutlet, ActionSheetController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import {  ViewChildren, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent implements OnInit {
  navigate:any;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  subscribe:any;
  alert:any;
  userInfo = JSON.parse(localStorage.getItem("currentUser"))
  public selectedIndex = 0;

  public appPages = [
  {
    title: 'Dashboard',
    url: '',
    icon: 'home'
  },
  {
    title: 'Logs-Summary',
    url: 'logs-summary',
    icon: 'list'
  },
  {
    title: 'My-Profile',
    url: 'user-profile',
    icon: 'person'
  },
  ];
  

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  constructor(
    private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar,
    private _router: Router, private actionSheetCtrl: ActionSheetController,private loginService: LoginService,
    public alertController: AlertController
    )  {
    this.userInfo = JSON.parse(localStorage.getItem("currentUser"));
    this.initializeApp();
    
    this.loginService.isLoggedIn.subscribe((data) => {
      if(data === 'loggedIn') {
        this.userInfo = JSON.parse(localStorage.getItem("currentUser"));
      }
    });

    this.backButtonEvent();
  }

  ngOnInit() {
    if(!this.userInfo){
      this._router.navigate(['/login']);
      console.log("the app is called");
    }else{
      console.log("called 2nd time");
      console.log(this.userInfo);
      this.userInfo = JSON.parse(localStorage.getItem("currentUser"));
      this._router.navigate(['/']);
    }
    
    this.subscribe = this.platform.backButton.subscribeWithPriority(666666,() => {
      if (this.constructor.name == "DashboardPage") {
        if (window.confirm("do you want to exit app")) {
          navigator["app"].exitApp();
        }
      }
    });
  }

  backButtonEvent() {
    this.platform.backButton.subscribe(async () => {
      try {
        const element = await this.actionSheetCtrl.getTop();
        if (element) {
          element.dismiss();
          return;
        }
      } catch (error) {
      }
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          outlet.pop();
        } else if (this._router.url === '') {
          if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            navigator['app'].exitApp(); 
          }
        }
      });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  logout(): void {
    this.selectedIndex = 0;
    if(localStorage.getItem('fillAttendanceLog')) {
      this.alert = this.alertController.create({
        message: 'do you want to stop your attendence?',
        buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.loginService.logout();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loginService.sendMessage('Message');
            this.loginService.logout();
          }
        }
        ]
      }).then((alert) => {
        alert.present();
      });
    }
    else {
      this.loginService.logout();
    }    
  }
}

