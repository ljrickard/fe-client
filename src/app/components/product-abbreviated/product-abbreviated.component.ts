import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-abbreviated',
  templateUrl: './product-abbreviated.component.html',
  styleUrls: ['./product-abbreviated.component.css']
})
export class ProductAbbreviatedComponent implements OnInit {
  @Input() product: any;

  constructor() { }

  ngOnInit() {
  }

}
