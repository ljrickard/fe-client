import { Component, OnInit, Input } from '@angular/core';
import { Filter, Gender, SkinType } from '../../models/Filters';
import { EsService } from '../../services/es.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {
  filters:Filter;

  constructor(public esService:EsService) { }

  ngOnInit() {
    this.filters = this.esService.getFilters();
  }

  onSubmit(){
    console.log("onSubmit");
    console.log(this.filters);
    this.esService.applyFilters(this.filters);
  }

}
