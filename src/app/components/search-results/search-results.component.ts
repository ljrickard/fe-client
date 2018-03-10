import { Component, Input, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  products: any[];

  constructor(public esService:EsService) {}

  ngOnInit() {
    this.esService.products$.subscribe(
      products => { this.products = products; });
  }

}
