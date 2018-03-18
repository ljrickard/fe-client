export class Filter {
  genders:Gender;
  skinType:SkinType;

  constructor(){
    this.genders={
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

  noFiltersSelected(){
    let allFilters = this.selectedFilters();
    if (allFilters.length <= 0) {
        return true;
    }
    return false;
  }

  filtersSelected(){
    let allFilters = this.selectedFilters();
    if (allFilters.length <= 0) {
        return false;
    }
    return true;
  }

  selectedFilters(){
    return this.getGenders()
   }

  getGenders(){
    let enumerableKeys = [];
    for (let gender of Object.keys(this.genders)) {
      if(this.genders[gender]===true){
        enumerableKeys.push(gender);
      }
    }
    return enumerableKeys;
   }
}

interface SkinType {
  normal:boolean;
  oily:boolean;
  dry:boolean;
  sensitive:boolean;
}

interface BodyParts {
  face:boolean;
  hands:boolean;
  arms:boolean;
  legs:boolean;
  back:boolean;
}

interface Gender {
  male:boolean;
  female:boolean;
  unisex:boolean;
}

