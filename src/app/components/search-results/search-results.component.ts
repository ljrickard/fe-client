import { Component, Input, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf } from '@angular/common';
import { Filter } from '../../models/Filter';
import { Product } from '../../models/Product';
import 'rxjs/add/operator/map';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  filters:any[];
  products:Product[]=[];

  constructor(public esService:EsService, private spinnerService: Ng4LoadingSpinnerService) {}

  ngOnInit() {
    this.spinnerService.show();
    this.esService.products$.subscribe(
      // products => {products.map(item => this.products.push(item)); this.spinnerService.hide();}
      products => {this.products = products; console.log(products); this.spinnerService.hide();}
    );

    this.esService.filters$.subscribe(
      filters => {this.filters = filters.getFilters();}
    );
  }

  onScroll () {
    this.spinnerService.show();
    this.esService.scrolled();
  }

}
