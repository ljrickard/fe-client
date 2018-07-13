import { Injectable } from '@angular/core';
import { Http } from '@angular/http'; //update to @angular/common/http
import { Filter } from '../models/Filter';
import { Product } from '../models/Product';
import { Client } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class EsService {
  client:Client
  selectedFilters:Filter = new Filter();

  // constants
  options:string[] = [ "ingredients", "name", "brand", "description"];
  searchOptions:Object = { 'All': this.options, 'Ingredients': 'ingredients', 'Name': 'name', 'Brand': 'brand', 'Description': 'description' };
  selectedSearchOption = 'All';
  type:string = 'skincare';

  productDetails = new Subject<Product>();
  productDetails$ = this.productDetails.asObservable();
  searchQuery = new Subject<string>();
  searchQuery$ = this.searchQuery.asObservable();

  // search params
  body:any
  index:string = 'products';
  size:number = 25; 
  from:number = 0;

  // inverted search params
  invertedFrom:number = 0;
  invertedFiltersBody:any;

  // observables
  products = new Subject<Product[]>();
  products$ = this.products.asObservable();
  filters = new Subject<Filter>();
  filters$ = this.filters.asObservable();
  searchResults = new Subject<Product[]>();
  searchResults$ = this.searchResults.asObservable();

  // inverted observables
  invertedFiltersResults = new Subject<Product[]>();
  invertedFiltersResults$ = this.invertedFiltersResults.asObservable();

  currentSearchQuery:string = '';
  currentProducts:Product[]=[];
  currentProductsInvertedFilters:Product[]=[];


  constructor(private http:Http) { 
    this.client = new Client({
      host: environment.esUrl,
      log: 'debug'
    });

    this.client.ping({requestTimeout: 30000,}, function (error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      }
    });
  }
  
  scrolled() {
    console.log('scrolled');
    this.from = this.from + this.size;
    this.continueSearch();
  }

  publishProducts() {
    console.log('publishProducts');
    this.from = 0;
    this.generateBody();
    console.log(this.body);
    this.continueSearch();
  }

  continueSearch() {
    this.client.search({
      index: this.index,
      from: this.from,
      size: this.size,
      type: this.type,
      body: this.body
    }).then((response) => {
      console.log(response.hits);
      this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
      this.products.next(this.currentProducts);

      if(this.selectedFilters.filtersSelected()){
        this.publishInvertedFilters();
      }

    }, error => {
            console.error(error);
        });
  }

  publishInvertedFilters() {
    console.log('publishInvertedFilters');
    this.invertedFrom = 0;
    console.log(this.invertedFiltersBody);
    this.continueInvertedSearch();
  }

  continueInvertedSearch() {
    this.currentProductsInvertedFilters = []
    this.client.search({
          index: this.index,
          from: this.invertedFrom,
          size: this.size,
          type: this.type,
          body: this.invertedFiltersBody
        }).then((response) => {
          console.log(response.hits);
          this.mapAllToProduct(response).map(product => this.currentProductsInvertedFilters.push(product));
          this.invertedFiltersResults.next(this.currentProductsInvertedFilters);
    }, error => {
            console.log(error);
        });
  }

  scrolledInverted() { 
    console.log("scrolledInverted");
    this.invertedFrom = this.invertedFrom + this.size;
    this.continueInvertedSearch();
  }

  publishFilters(){
    this.filters.next(this.selectedFilters);
  }

  publishSearchQuery(){
    this.searchQuery.next(this.currentSearchQuery);
  }

  mapAllToProduct(response){
    return response.hits.hits.map(
      hit => new Product(hit._id, hit._source.name, 
                          hit._source.s3_images[0], 
                          hit._source.tagline, 
                          hit._source.gender, 
                          hit._source.ingredients,
                          hit._source.description,
                          hit._source.tags,
                          hit._source.images,
                          parseFloat(hit._score),
                          hit._source.skin_type,
                          hit._source.unique_id,
                          hit._source.source_url));
  }

  generateBody(){
    this.currentProducts = []
    this.invertedFiltersBody = ''

    if(this.currentSearchQuery === "" && this.selectedFilters.noFiltersSelected()) {
      console.log('generateBody: 1');
      this.body = {query: {match_all: {}}}
    }

    else if(this.currentSearchQuery !== "" && this.selectedFilters.noFiltersSelected()) {
      console.log('generateBody: 2');
      this.body = {query: {multi_match: 
        {fields: this.searchOptions[this.selectedSearchOption], query: this.currentSearchQuery}}};
    }
    else if(this.currentSearchQuery === "" && this.selectedFilters.filtersSelected()) {
      console.log('generateBody: 3');
      this.body = {query: {bool: 
        {filter: {bool: {must: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};

      this.invertedFiltersBody =  {query: {bool: 
        {filter: {bool: {must_not: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};
    }
    else if(this.currentSearchQuery !== "" && this.selectedFilters.filtersSelected()) {
      console.log('generateBody: 4');
      this.body = {query: {bool: {must: {multi_match: 
        {fields: this.searchOptions[this.selectedSearchOption], query: this.currentSearchQuery}}, 
        filter: {bool: {must: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};

      this.invertedFiltersBody = {query: {bool: {must: {multi_match: 
        {fields: this.searchOptions[this.selectedSearchOption], query: this.currentSearchQuery}}, 
        filter: {bool: {must_not: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};
    }
  }

  convertFilterToEs(filter){
    let result=[];
    for(let something of Object.keys(filter)){
      result.push({terms: {[something]: filter[something].map(function(x){ return x.toUpperCase() })}});
    }
    return result;
  }

  getSearchOptions() {
    return Object.keys(this.searchOptions);
  }

  searchOption(selectedSearchOption:string) {
    this.selectedSearchOption = selectedSearchOption;
  }

  searchForSuggestions(searchQuery:string) {
    this.client.search({ 
          index: this.index,
          type: this.type,
          body: {query: {multi_match: {fields: this.searchOptions[this.selectedSearchOption], query: searchQuery}}}
        }).then((response) => {
          this.searchResults.next(this.mapAllToProduct(response));
        }, error => {
            console.error(error);
        });
  }

  search(searchQuery:string) {
    this.currentSearchQuery = searchQuery;
    this.publishSearchQuery()
    this.publishProducts();
    this.publishFilters();
  }

  clearFilters() {
    this.publishProducts();
    this.publishFilters();
  }

  applyFilters(filters:Filter) {
    this.selectedFilters = filters;
    this.publishProducts();
    this.publishFilters();

  }

  getProduct(id:string){
    this.client.get({
      index: this.index,
      type: this.type,
      id: id
      }).then((response) => { 
          this.productDetails.next(this.mapToProduct(response)); 
        }, error => { 
          console.error(error); 
        });
    }

  mapToProduct(response){
    return new Product(response._id, response._source.name, 
                          response._source.s3_images[0], 
                          response._source.tagline, 
                          response._source.gender, 
                          response._source.ingredients,
                          response._source.description,
                          response._source.tags,
                          response._source.s3_images,
                          parseFloat(response._score),
                          response._source.skin_type,
                          response._source.unique_id,
                          response._source.source_url);
  }
}





