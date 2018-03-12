import { Component, OnInit } from '@angular/core';
import { EsService } from '../../services/es.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {
  searchOptions:string[];
  selectedsearchOption:string;
  searchResponse:any[];
  searchText = '';
  showAbbreviatedResults = false;

  constructor(public esService:EsService) { }

  ngOnInit() {
    this.esService.searchResults$.subscribe(
      searchResponse => { this.searchResponse = searchResponse;});
    this.searchOptions = this.esService.getSearchOptions();
    this.selectedsearchOption = this.searchOptions[0];
  }

  searchOptionChanged(selectedsearchOption:string) {
    this.esService.searchOption(selectedsearchOption);
  }

  onSearchChange() {
    this.showAbbreviatedResults = true;
    this.esService.searchInput(this.searchText);
  }

  Search(){
    this.showAbbreviatedResults = false;
    this.esService.search(this.searchText);
  }

}
