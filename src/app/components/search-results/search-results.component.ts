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
    this.esService.getProducts().subscribe(products => {
      this.products = products['hits']['hits'];
      console.log(this.products);
    });
  }

}
