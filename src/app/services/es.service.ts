import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Filter } from '../models/Filter';
import { Product } from '../models/Product';
import { Client } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

@Injectable()
export class EsService {
  client:Client
  body:any
  index:string = 'products';
  scrollTimeout:string = '60s';
  size:number = 25;
  type:string = 'skincare'; 
  selectedFilters:Filter = new Filter();
  options:string[] = [ "ingredients", "name", "brand", "description"]
  searchOptions:Object = { 'All': this.options, 'Ingredients': 'ingredients', 'Name': 'name', 'Brand': 'brand', 'Description': 'description' };
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
  invertedFiltersBody:any;
  currentProductsLength:number = 0;
  searchFrom:string = '';
  LastFrom:string = '';

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
  }

  // scrolled() { 
  //   console.log('scrolled');
  //   this.client.scroll({
  //     scrollId: this.scrollId,
  //     scroll: this.scrollTimeout,
  //   }).then((response) => {
  //         this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
  //         this.products.next(this.currentProducts);
  //       }, error => {
  //           console.log(error);
  //       });
  // }

  
  scrolled() {
    console.log('scrolled');
    // this.generateBody();

    // if(this.LastFrom === this.searchFrom){
    //   console.log('no more!');
    //   return
    // }

    this.LastFrom = this.searchFrom;

    this.client.search({
          index: this.index,
          size: this.size,
          // scroll: this.scrollTimeout,
          type: this.type,
          body: {query: {match_all: {}}, search_after: [this.searchFrom], sort: [{unique_id: 'asc'}]}
        }).then((response) => {

          // this.scrollId = response._scroll_id;
          this.searchFrom = this.getLastUniqueId(response);
          console.log(this.searchFrom);
          console.log(response);
          this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
          this.products.next(this.currentProducts);

          if(this.selectedFilters.filtersSelected()){
            // this.publishInvertedFilters();
          }

    }, error => {
            console.log(error);
        });
  }


  publishProducts() {
    console.log('publishProducts');
    this.generateBody();

    this.client.search({
          index: this.index,
          size: this.size,
          // scroll: this.scrollTimeout,
          type: this.type,
          body: this.body
        }).then((response) => {

          // this.scrollId = response._scroll_id;
          this.searchFrom = this.getLastUniqueId(response);
          console.log(response);
          console.log(this.searchFrom);
          this.mapAllToProduct(response).map(product => this.currentProducts.push(product));
          this.products.next(this.currentProducts);

          if(this.selectedFilters.filtersSelected()){
            // this.publishInvertedFilters();
          }

    }, error => {
            console.log(error);
        });
  }

  getLastUniqueId(response) {
    if(response.hits.hits.length > 0){
      return response.hits.hits[response.hits.hits.length-1]._source.unique_id;
    }
  }

  publishInvertedFilters() {
  this.currentProductsInvertedFilters = []
    this.client.search({
          index: this.index,
          scroll: this.scrollTimeout,
          type: this.type,
          body: this.invertedFiltersBody
        }).then((response) => {
          this.scrollIdInverted = response._scroll_id;
          this.mapAllToProduct(response).map(product => this.currentProductsInvertedFilters.push(product));
          this.invertedFiltersResults.next(this.currentProductsInvertedFilters);
    }, error => {
            console.log(error);
        });
  }

  scrolledInverted() { 
    this.client.scroll({
      scrollId: this.scrollIdInverted,
      scroll: this.scrollTimeout,
    }).then((response) => {
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
                          parseFloat(hit._score),
                          hit._source.skin_type,
                          hit._source.unique_id));
  }

  generateBody(){
    this.currentProducts = []
    this.invertedFiltersBody = ''

    if(this.currentSearchQuery === "" && this.selectedFilters.noFiltersSelected()) {
      // this.body = {query: {match_all: {}}}
      this.body = {query: {match_all: {}}, sort: [{unique_id: 'asc'}]}
    }

    else if(this.currentSearchQuery !== "" && this.selectedFilters.noFiltersSelected()) {
      this.body = {query: {multi_match: 
        {fields: this.searchOptions[this.selectedsearchOption], query: this.currentSearchQuery}}};
    }
    else if(this.currentSearchQuery === "" && this.selectedFilters.filtersSelected()) {
      this.body = {query: {bool: 
        {filter: {bool: {must: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};

      this.invertedFiltersBody =  {query: {bool: 
        {filter: {bool: {must_not: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};
    }
    else if(this.currentSearchQuery !== "" && this.selectedFilters.filtersSelected()) {
      this.body = {query: {bool: {must: {multi_match: 
        {fields: this.searchOptions[this.selectedsearchOption], query: this.currentSearchQuery}}, 
        filter: {bool: {must: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};

      this.invertedFiltersBody = {query: {bool: {must: {multi_match: 
        {fields: this.searchOptions[this.selectedsearchOption], query: this.currentSearchQuery}}, 
        filter: {bool: {must_not: this.convertFilterToEs(this.selectedFilters.selectedFilters())}}}}};
    }
  }

  convertFilterToEs(filter){
    let result=[];
    for(let something of Object.keys(filter)){
      result.push({terms: {[something]: filter[something]}});
    }
    return result;
  }

  getSearchOptions() {
    return Object.keys(this.searchOptions);
  }

  searchOption(selectedsearchOption:string) {
    this.selectedsearchOption = selectedsearchOption;
  }

  searchForSuggestions(searchQuery:string) {
    // let body = {query: {multi_match: {fields: this.searchOptions[this.selectedsearchOption], query: searchQuery}}}

    this.client.search({ 
          index: this.index,
          type: this.type,
          body: {query: {multi_match: {fields: this.searchOptions[this.selectedsearchOption], query: searchQuery}}}
        }).then((response) => {
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
    this.client.get({
      index: this.index,
      type: this.type,
      id: id
      }).then((response) => {
          this.productDetails.next(this.mapToProduct(response));
        }, error => {
            console.log(error);
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
                          response._source.images,
                          parseFloat(response._score),
                          response._source.skin_type,
                          response._source.unique_id);
  }
}

// curl - H 'Content-Type: application/json'
// 'localhost:9200/get-together/event/_search' - d '{"query": {"bool": {"must": {"match": {"title": "hadoop"}},"filter": {"term": {"host": "andy"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/get-together/event/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"host": "andy"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/products/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"gender": "male"}}}}}'
// curl -H 'Content-Type: application/json' 'localhost:9200/products/product/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"gender": "male"}}}}}'

// sortBy:string = "unique_id:asc";
// searchAfter:string = '';

// +//   {
// +//     "size": 10,
// +//     "query": {
// +//         "match_all" : {}
// +//     }, "search_after": ["Kiehls-Ultra-Facial-Moisturizer-SPF-30"],
// +//     "sort": [
// +//         {"_id": "desc"}
// +//     ]
// +//   }




