export class Filter {
  gender:Gender;
  skinType:SkinType;

  constructor(){
    this.gender={
      male:false,
      female:false,
      unisex:false
    }
    this.skinType={
      normal:false,
      oily:false,
      dry:false,
      sensitive:false
    }
  }

  filters(){
    return {gender: this.gender, skin_type: this.skinType}
  }

  noFiltersSelected(){
    return Object.keys(this.selectedFilters()).length === 0;
  }

  filtersSelected(){
    return Object.keys(this.selectedFilters()).length != 0;
  }

  selectedFilters(){
    let selectedFilters = {};
    let filters = this.filters(); 
    for (let filter of Object.keys(filters)){
        let selectedItems = [];
        let currentItems = []
        for (let item of Object.keys(filters[filter])) {
          if(filters[filter][item]===true){
            if (!selectedFilters.hasOwnProperty(filter)){
              selectedFilters[filter]=[];
            }
            selectedFilters[filter].push(item);
          }
      }
    }
    console.log(selectedFilters);
    return selectedFilters;
   }
}

interface SkinType {
  normal:boolean;
  oily:boolean;
  dry:boolean;
  sensitive:boolean;
}

interface Gender {
  male:boolean;
  female:boolean;
  unisex:boolean;
}

