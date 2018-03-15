import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Filter } from '../models/Filter';
import { Product } from '../models/Product';
import { Client } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as Bodybuilder from 'bodybuilder';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

// TODO: 
// 1. Scroll timesout after 30secs - handle errors
// 2. Update type to skincare

@Injectable()
export class EsService {
  client: Client
  body: any
  index:string = 'products';
  scrollTimeout:string = '60s';
  type:string = 'product'; 
  match_all = { query: { match_all: {} } }
  searchQuery:string = '';
  selectedFilters:Filter = new Filter();
  searchOptions=['All', 'Ingreidents'];
  selectedsearchOption = this.searchOptions[0];
  scrollId:any;
  products = new Subject<Product[]>();
  products$ = this.products.asObservable();
  filters = new Subject<Filter>();
  filters$ = this.filters.asObservable();
  searchResults = new Subject<any[]>();
  searchResults$ = this.searchResults.asObservable();
  currentProducts:Product[]=[];

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

    // this.body = this.match_all;
    this.generateBody();
    this.publishProducts();
    this.filters.next(new Filter());
  }

  scrolled() { 
    this.client.scroll({
      scrollId: this.scrollId,
      scroll: this.scrollTimeout,
    }).then((response) => {
          console.log(response);
          this.mapToProduct(response).map(product => this.currentProducts.push(product));
          this.products.next(this.currentProducts);
        }, error => {
            console.log(error);
            this.currentProducts = [] //clear current products 
            this.publishProducts(); //this needs to be reworked
            this.scrolled();
        });
  }

  publishProducts() {
    this.client.search({
          index: this.index,
          scroll: this.scrollTimeout,
          type: this.type,
          body: this.body
        }).then((response) => {
          console.log(response);
          this.scrollId = response._scroll_id;
          this.mapToProduct(response).map(product => this.currentProducts.push(product));
          this.products.next(this.currentProducts);
    });
  }

  mapToProduct(response){
    return response.hits.hits.map(
      hit => new Product(hit._id, hit._source.name, 
                          hit._source.s3_images[0], 
                          hit._source.tagline, 
                          hit._source.gender, 
                          hit._source.ingredients,
                          hit._source.description,
                          hit._source.tags,
                          hit._source.images));
  }

  generateBody(){
     
    if(this.searchQuery === "" && this.selectedFilters.noFiltersSelected()){
      console.log(Bodybuilder().query('match_all', {}).build());
      this.body = Bodybuilder().query('match_all', {}).build();
    }
    else if(this.searchQuery !== "" && this.selectedFilters.noFiltersSelected()) {
      console.log(Bodybuilder().query('match', '_all', this.searchQuery).build());
      this.body = Bodybuilder().query('match', '_all', this.searchQuery).build();
    }
    else if(this.searchQuery === "" && this.selectedFilters.filtersSelected()) {
      console.log(Bodybuilder().query('match_all').filter('terms', 'gender', 'male').build());
      this.body = Bodybuilder().query('match_all').filter('terms', 'gender', 'male').build(); //Fix me!
    }
    else if(this.searchQuery !== "" && this.selectedFilters.filtersSelected()) {
      console.log(Bodybuilder().query('match', '_all', 'searchQuery').filter('terms', 'gender', 'male').build());
      this.body = Bodybuilder().query('match', '_all', 'searchQuery').filter('terms', 'gender', 'male').build();
    }
  }

  getSearchOptions(){
    return this.searchOptions;
  }

  searchOption(selectedsearchOption:string) {
    this.selectedsearchOption = selectedsearchOption;
  }

  searchForSuggestions(searchQuery:string) {

    this.searchQuery = searchQuery;

    let body = { query: { match: { _all: this.searchQuery} } }

    this.client.search({
          index: 'products',
          type: 'product',
          body: body
        }).then((response) => {
          console.log(response);
          this.searchResults.next(response.hits.hits);
        });
    }

  search(searchQuery:string) {

    this.searchQuery = searchQuery;

    if(this.searchQuery === ""){
      this.clearFilters(); //TODO: update to retain filters but clear search
    }
    else{
      console.log("perform search");
      this.body = { query: { match: { _all: this.searchQuery} } }
      this.currentProducts = [] //clear current products 
      this.publishProducts();
    }
  }

  clearFilters() {
    this.body = this.match_all;
    this.publishProducts();
  }

  applyFilters(filters:Filter) {

    this.selectedFilters = filters;

    if(filters.noFiltersSelected()){
      this.clearFilters();
    }
    else{
      this.body = {query: {bool: {must: {match_all: {}}, filter: {terms: {gender: filters.selectedFilters()}}}}};
      this.publishProducts();
      this.filters.next(filters);
    }

  }

}

