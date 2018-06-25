import { Component, OnInit } from '@angular/core';
import { VERSION } from '../../../environments/version';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  version:string = VERSION.hash; 

  constructor() { }

  ngOnInit() {
  }

}
