import { Component, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  products:any[];

  constructor(public esService:EsService) { }

  ngOnInit() {

    this.products = [];

    // this.esService.updateData();

    // this.esService.data$.subscribe(data => { // subscribe once to the data stream
    //   console.log('subscribe');
    //   console.log(data);
    //   this.products = data;
    // })

    this.esService.getProducts().subscribe(products => {
      console.log('ngOnInit');
      this.products = products['hits']['hits'];
      console.log(this.products);
    });
  }

}
