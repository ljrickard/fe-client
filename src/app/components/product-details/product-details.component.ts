import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { EsService } from '../../services/es.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  brand:string;
  productName:string;
  product:any;

  constructor(private route:ActivatedRoute, private router:Router, public esService:EsService) {}
  // {brand: "kiehls", productName: "Rosa-Arctica-Eye"}
  ngOnInit() {


    this.route.params.subscribe((params:Params) => { this.brand = params.brand; this.productName = params.productName; });
    let result = this.esService.getProduct(this.brand, this.productName).subscribe(product => { this.product = product; console.log(this.product)});
  }

}
