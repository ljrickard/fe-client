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
      dry:false,
      wet:false
    }
  }

  noFiltersSelected(){
    let allFilters = this.getFilters();
    if (allFilters.length <= 0) {
        return true;
    }
    return false;
  }

  getFilters(){
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

export interface SkinType {
  dry:boolean;
  wet:boolean;
}

export interface Gender {
  male:boolean;
  female:boolean;
  unisex:boolean;
}

