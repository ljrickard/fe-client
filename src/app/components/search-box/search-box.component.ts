import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf } from '@angular/common';
import { Product } from '../../models/Product';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {
  searchOptions:string[];
  selectedsearchOption:string;
  searchResponse:Product[];
  searchText = '';
  showAbbreviatedResults = false;
  showClearSearchText = false;

  constructor(private esService:EsService, private elementRef: ElementRef){}

  ngOnInit(){
    this.esService.searchResults$.subscribe(
      searchResponse => { this.searchResponse = searchResponse;});
    this.searchOptions = this.esService.getSearchOptions();
    this.selectedsearchOption = this.searchOptions[0];
  }

  @HostListener('document:click', ['$event'])
  clickout(event){
    this.showAbbreviatedResults = false;
  }

  searchOptionChanged(selectedSearchOption:string){
    this.esService.searchOption(selectedSearchOption);
  }

  onSearchChange(){
    this.showClearSearchText = true;
    this.showAbbreviatedResults = true;
    this.esService.searchForSuggestions(this.searchText);
  }

  search(){
    this.showAbbreviatedResults = false;
    this.esService.search(this.searchText);
  }

  clearSearchText(){
    this.searchText = '';
    this.showClearSearchText = false;
    this.search();
  }

}
