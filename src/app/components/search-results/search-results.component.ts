import { Component, Input, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf } from '@angular/common';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  products: any[] = [];

  constructor(public esService:EsService) {}

  ngOnInit() {
    this.esService.products$.subscribe(
      products => {products.map(item => this.products.push(item))}
    );
  }

  onScroll () {
    this.esService.scrolled();
  }

}
