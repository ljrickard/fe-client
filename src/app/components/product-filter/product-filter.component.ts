import { Component, OnInit, Input } from '@angular/core';
import { Filter } from '../../models/Filter';
import { EsService } from '../../services/es.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {
  filters:Filter = new Filter();
  products:any[];

  constructor(public esService:EsService) { }

  ngOnInit() {
    this.esService.filters$.subscribe(
      filters => {this.filters = filters;}
    );
  }

  onSubmit(){
    this.esService.applyFilters(this.filters);
  }

}
