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

@Injectable()
export class EsService {
  client:Client
  body:any
  index:string = 'products';
  scrollTimeout:string = '60s';
  type:string = 'skincare'; 
  selectedFilters:Filter = new Filter();
  searchOptions:Object = { 'All': 'skincare', 'Ingredients': 'ingredients', 'Name': 'name', 'Brand': 'brand', 'Description': 'description' };
  selectedsearchOption = 'All';
  scrollId:string;
  scrollIdInverted:string;
  products = new Subject<Product[]>();
  products$ = this.products.asObservable();
  filters = new Subject<Filter>();
  filters$ = this.filters.asObservable();
  searchResults = new Subject<Product[]>();
  searchResults$ = this.searchResults.asObservable();
  invertedFiltersResults = new Subject<Product[]>();
  invertedFiltersResults$ = this.invertedFiltersResults.asObservable();
  productDetails = new Subject<Product>();
  productDetails$ = this.productDetails.asObservable();
  searchQuery = new Subject<string>();
  searchQuery$ = this.searchQuery.asObservable();
  currentSearchQuery:string = '';
  currentProducts:Product[]=[];
  currentProductsInvertedFilters:Product[]=[];
  invertedFiltersBody:string;
  currentProductsLength:number = 0;

  constructor(private http:Http) { 
    this.client = new Client({
      host: 'http://127.0.0.1:9200',
      log: 'debug'
    });

    this.client.ping({requestTimeout: 30000,}, function (error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      }
    });

    // this.generateBody();
    // this.publishProducts();
    // this.filters.next(new Filter());
  }

  scrolled() { 
    this.client.scroll({
      scrollId: this.scrollId,
      scroll: this.scrollTimeout,
    }).then((response) => {
          console.log(response);
          this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
          console.log(this.currentProducts.length);
          this.products.next(this.currentProducts);
        }, error => {
            console.log(error);
            // this.currentProducts = [] //clear current products - most likely timeout
            // this.currentProductsLength = 0;
            // this.publishProducts(); //this needs to be reworked
            // this.scrolled();
        });
  }

  
  publishProducts() {
    console.log('publishProducts');
    this.generateBody();

    this.client.search({
          index: this.index,
          scroll: this.scrollTimeout,
          type: this.type,
          body: this.body
        }).then((response) => {
          console.log(response);
          this.scrollId = response._scroll_id;
          this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
          console.log(this.currentProducts.length);
          this.products.next(this.currentProducts);
          if(this.selectedFilters.filtersSelected()){
            this.publishInvertedFilters();
          }
    }, error => {
            console.log(error);
        });
  }

  publishInvertedFilters() {
  console.log('publishInvertedFilters');
    this.client.search({
          index: this.index,
          scroll: this.scrollTimeout,
          type: this.type,
          body: this.invertedFiltersBody
        }).then((response) => {
          console.log(response);
          this.scrollIdInverted = response._scroll_id;
          this.mapAllToProduct(response).map(product => this.currentProductsInvertedFilters.push(product));
          console.log(this.currentProductsInvertedFilters.length)
          this.invertedFiltersResults.next(this.currentProductsInvertedFilters);
    }, error => {
            console.log(error);
        });
  }

  scrolledInverted() { 
    console.log('scrolledInverted');
    this.client.scroll({
      scrollId: this.scrollIdInverted,
      scroll: this.scrollTimeout,
    }).then((response) => {
          console.log(response);
          this.mapAllToProduct(response).map(product => this.currentProductsInvertedFilters.push(product));
          console.log(this.currentProductsInvertedFilters.length)
          this.invertedFiltersResults.next(this.currentProductsInvertedFilters);
        }, error => {
            console.log(error);
        });
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
                          parseFloat(hit._score)));
  }

  generateBody(){
    // console.log('generateBody');
    this.currentProducts = []
    this.invertedFiltersBody = ''

    if(this.currentSearchQuery === "" && this.selectedFilters.noFiltersSelected()) {
      console.log('generateBody 1');
      this.body = Bodybuilder()
                    .query('match_all', {})
                    .build();
      console.log(this.body);
    }
    else if(this.currentSearchQuery !== "" && this.selectedFilters.noFiltersSelected()) {
      console.log('generateBody 2');
      // this.body = Bodybuilder()
      //               .query('match', this.searchOptions[this.selectedsearchOption], this.searchQuery)
      //               .build();
      this.body = {query: {multi_match: {fields: [ "ingredients", "name", "brand", "description"], query: this.currentSearchQuery}}};
      console.log(this.body);
    }
    else if(this.currentSearchQuery === "" && this.selectedFilters.filtersSelected()) {
      console.log('generateBody 3');
      this.body = Bodybuilder()
                    .filter('terms', 'gender', this.selectedFilters.selectedFilters())
                    .query('match_all').build(); //Fix me!
      console.log(this.body);

      //not filter
      this.invertedFiltersBody = Bodybuilder()
                    .notFilter('terms', 'gender', this.selectedFilters.selectedFilters())
                    .query('match_all').build(); //Fix me!
      console.log(this.invertedFiltersBody);
      
    }
    else if(this.currentSearchQuery !== "" && this.selectedFilters.filtersSelected()) {
      console.log('generateBody 4');
      this.body = Bodybuilder()
                    .filter('terms', 'gender', this.selectedFilters.selectedFilters())
                    .query('match', this.searchOptions[this.selectedsearchOption], this.searchQuery)
                    .build();

      console.log(this.body);      

      //not filter
      this.invertedFiltersBody = Bodybuilder()
                    .notFilter('terms', 'gender', this.selectedFilters.selectedFilters())
                    .query('match', this.searchOptions[this.selectedsearchOption], this.searchQuery)
                    .build();
      console.log(this.invertedFiltersBody);      
    }
  }

  getSearchOptions() {
    return Object.keys(this.searchOptions);
  }

  searchOption(selectedsearchOption:string) {
    this.selectedsearchOption = selectedsearchOption;
  }

  searchForSuggestions(searchQuery:string) {
    let body = {query: {multi_match: {fields: [ "ingredients", "name", "brand", "description"], query: searchQuery}}}

    console.log(body);
    
    this.client.search({ 
          index: this.index,
          type: this.type,
          body: body
        }).then((response) => {
          console.log(response.hits.total);
          this.searchResults.next(this.mapAllToProduct(response));
        }, error => {
            console.log(error);
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
    console.log(id);
    this.client.get({
      index: this.index,
      type: this.type,
      id: id
      }).then((response) => {
          console.log(response);
          this.productDetails.next(this.mapToProduct(response));
        }, error => {
            console.log(error);
        });
      //handle found is false!
    }

  mapToProduct(response){
    return new Product(response._id, response._source.name, 
                          response._source.s3_images[0], 
                          response._source.tagline, 
                          response._source.gender, 
                          response._source.ingredients,
                          response._source.description,
                          response._source.tags,
                          response._source.images,
                          parseFloat(response._score));
  }
}

// curl - H 'Content-Type: application/json'
// 'localhost:9200/get-together/event/_search' - d '{"query": {"bool": {"must": {"match": {"title": "hadoop"}},"filter": {"term": {"host": "andy"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/get-together/event/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"host": "andy"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/products/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"gender": "male"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/products/product/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"gender": "male"}}}}}'



