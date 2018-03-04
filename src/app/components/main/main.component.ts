import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  showMenu: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu():void {
    console.log('clicked');
    this.showMenu = !this.showMenu;
  }

}
