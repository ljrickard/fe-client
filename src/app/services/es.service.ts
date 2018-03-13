import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Filter, Gender, SkinType } from '../models/Filters';
import { Client } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as Bodybuilder from 'bodybuilder';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

@Injectable()
export class EsService {
  client: Client
  body: Bodybuilder
  products = new Subject<any[]>();
  products$ = this.products.asObservable();
  filters = new Filter();
  match_all = { query: { match_all: {} } }
  searchOptions=['All', 'Ingreidents'];
  selectedsearchOption = this.searchOptions[0];
  scrollId:any;

  constructor(public http:Http) { 
    this.client = new Client({
      host: 'http://127.0.0.1:9200',
      log: 'debug'
    });

    this.client.ping({requestTimeout: 30000,}, function (error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      }
    });

    this.body = this.match_all;
    this.publishProducts();
  }

  scrolled() { 
    this.client.scroll({
      scrollId: this.scrollId,
      scroll: '30s'
    }).then((response) => {
          console.log(response);
          this.products.next(response.hits.hits);
        });
  }

  publishProducts() {
    this.client.search({
          index: 'products',
          scroll: '120s',
          type: 'product',
          body: this.body
        }).then((response) => {
          console.log(response);
          this.scrollId = response._scroll_id;
          this.products.next(response.hits.hits);
        });
  }

  searchResults = new Subject<any[]>();
  searchResults$ = this.searchResults.asObservable();

  getSearchOptions(){
    return this.searchOptions;
  }

  searchOption(selectedsearchOption:string) {
    this.selectedsearchOption = selectedsearchOption;
    console.log(this.selectedsearchOption);
  }

  searchInput(searchValue:string) {

    let searchQuery = { query: { match: { _all: searchValue} } }

    this.client.search({
          index: 'products',
          type: 'product',
          body: searchQuery
        }).then((response) => {
          console.log(response);
          this.searchResults.next(response.hits.hits);
        });
  }

  search(searchValue:string) {
    if(searchValue === ""){
      this.clearFilters(); //TODO: update to retain filters but clear search
    }
    else{
      this.body = { query: { match: { _all: searchValue} } }
      this.publishProducts();
    }
  }

  getProduct(brand:string, productName:string){
    //  http://127.0.0.1:9200/products/_search?q=brand:kiehls+name:"Blue Herbal Moisturizer"
    //  return this.http.get('http://127.0.0.1:9200/products/product/'+productId).map(res => res.json());
    console.log('http://127.0.0.1:9200/products/_search?q=brand:'+'\"'+this.removeHyphens(brand)+'\"'+'+name:'+'\"'+this.removeHyphens(productName)+'\"');
    return this.http.get('http://127.0.0.1:9200/products/_search?q=brand:'+'\"'+this.removeHyphens(brand)+'\"'+'+name:'+'\"'+this.removeHyphens(productName)+'\"').map(res => res.json());
  }

  removeHyphens(input:string){
    let re = /-/gi;
    return input.replace(re, " ");
  }

  clearFilters() {
    this.body = this.match_all;
    this.publishProducts();
  }

  getFilters() {
    return this.filters;
  }

  applyFilters(filters:Filter) {
    if(filters.noFiltersSelected()){
      this.clearFilters();
    }
    else{
      this.body = {query: {bool: {must: {match_all: {}}, filter: {terms: {gender: filters.getFilters()}}}}};
      this.publishProducts();
    }

  }

}







