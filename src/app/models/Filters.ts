export interface Filter {
  gender:Gender;
  skinType:SkinType;
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

