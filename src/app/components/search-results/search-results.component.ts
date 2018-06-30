import { Component, Input, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf, NgForOf } from '@angular/common';
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
  filters:any;
  showInvertedFilters = false;
  products:Product[]=[];
  productsInvertedFilters:Product[]=[];
  searchQuery:string='';
  objectKeys = Object.keys;

  constructor(private esService:EsService, private spinnerService: Ng4LoadingSpinnerService) {}

  ngOnInit() {
    this.spinnerService.show();
    this.esService.publishProducts();
    this.esService.products$.subscribe(
      products => {
          this.products = products; 
          this.spinnerService.hide();
      }
    );

    this.esService.publishFilters();
    this.esService.filters$.subscribe(
      filters => {
        this.filters = filters.selectedFilters();
      }
    );

    this.esService.invertedFiltersResults$.subscribe(
      productsInvertedFilters => {
          this.productsInvertedFilters = productsInvertedFilters; 
          this.spinnerService.hide();
      }
    );

    this.esService.publishSearchQuery();
    this.esService.searchQuery$.subscribe(
      searchQuery => {
        this.searchQuery = searchQuery;
      }
    );
  }

  appliedFilters() {
    return Object.keys(this.filters);
  }

  onScroll(){
    this.spinnerService.show();
    this.esService.scrolled();
  }

  onScrollInverted(){
    this.spinnerService.show();
    this.esService.scrolledInverted();
  }

}
