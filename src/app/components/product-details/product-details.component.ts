import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { EsService } from '../../services/es.service';
import { Product } from '../../models/Product';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  objectKeys = Object.keys;
  id:string
  productDetails:Product;

  constructor(private route:ActivatedRoute, private router:Router, private esService:EsService) {}
  ngOnInit() {

    this.esService.productDetails$.subscribe(
      productDetails => { this.productDetails = productDetails; console.log(this.productDetails.images)});

    this.route.params.subscribe((params:Params) => { this.id = params.id; });
    this.esService.getProduct(this.id);
  }

}
