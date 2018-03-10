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
  observe: Observable<any>;
  products = new Subject<any[]>();
  products$ = this.products.asObservable();

  filters:Filter = {
    gender:{
      male:false,
      female:false,
      unisex:false
    },
    skinType: {
      dry:false,
      wet:false
    }
  }

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

    this.publishProducts();
  }

  publishProducts() {
    this.client.search({
          index: 'products',
          type: 'product',
          body: this.body
        }).then((res) => {
          this.products.next(res.hits.hits);
        });
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

  getFilters() {
    return this.filters;
  }

  applyFilters(filters:Filter) {
    //curl -H 'Content-Type: application/json' 'localhost:9200/products/product/_search' -d '{"query": {"bool": {"must": {"match_all": {}},"filter": {"term": {"gender": "male"}}}}}'
    this.body = {query: {bool: {must: {match_all: {}}, filter: {term: {gender: 'male'}}}}};
    this.publishProducts();
  }

}
