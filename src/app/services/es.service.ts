import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Filter, Gender, SkinType } from '../models/Filters';
import { Client } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as Bodybuilder from 'bodybuilder';
import { NgZone } from '@angular/core';
import 'rxjs/add/operator/do';

@Injectable()
export class EsService {
  products: Observable<any>;
  client: Client
  body: Bodybuilder
  data$: BehaviorSubject<any> = new BehaviorSubject({});
  observe: Observable<any>;

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

  constructor(public zone: NgZone, public http:Http) { 
    this.client = new Client({
      host: 'http://127.0.0.1:9200',
      log: 'debug'
    });

    this.client.ping({requestTimeout: 30000,}, function (error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      }
    });

    this.body = Bodybuilder()
                  .query('match_all')
                  .build()

    
    this.observe = new Observable(observer => {

      console.log('getProducts');
      console.log(this.body);

      this.client.search({
          index: 'products',
          type: 'product',
          body: this.body
        }).then(function (resp) {
            console.log('resp');
            console.log(resp);
            observer.next(resp);
        }, function (err) {
            console.error(err.message);
        });
    })

  }

  updateData(){
    console.log('updateData');

    let data = new Observable(observer => {
      this.client.search({
          index: 'products',
          type: 'product',
          body: this.body
        }).then(function (resp) {
            console.log('updateData');
            console.log(resp);
            return resp;
        }, function (err) {
            console.error(err.message);
        });
    }).do((data)=>{
        this.data$.next(data);
    })
  }

  getProducts(){
    this.products = new Observable(observer => {

      console.log('getProducts');
      console.log(this.body);

      this.client.search({
          index: 'products',
          type: 'product',
          body: this.body
        }).then(function (resp) {
            console.log('resp');
            console.log(resp);
            observer.next(resp);
        }, function (err) {
            console.error(err.message);
        });
    })

    console.log('return this.products;');

    return this.products;
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
    console.log(this.filters);
    return this.filters;
  }

  applyFilters(filters:Filter) {
    console.log('applyFilters');

    this.body = Bodybuilder().filter('query_string', 'gender', 'male').build();
    console.log(this.body);


  }



}
