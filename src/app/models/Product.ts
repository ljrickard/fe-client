export class Product {

  id:string;
  name:string;
  brand:string;
  primaryImage:string;
  tagline:string;
  gender:string[];
  ingredients:string[];
  description:string;
  tags:string[]
  images:string[];
  score:number;
  skinType:string;
  uniqueId:string;
  sourceUrl:string;

  constructor(id:string, name:string, brand:string,
                primaryImage:string, tagline:string,
                gender:string[], ingredients:string[],
                description:string, tags:string[],
                images:string[], score:number, 
                skinType:string, uniqueId:string,
                sourceUrl:string){

    this.id = id;
    this.name = name;
    this.primaryImage = primaryImage;
    this.brand = brand;
    this.tagline = tagline;
    this.gender = gender;
    this.ingredients = ingredients;
    this.description = description;
    this.tags = tags;
    this.images = images;
    this.score = score;
    this.skinType = skinType;
    this.uniqueId = uniqueId;
    this.sourceUrl = sourceUrl;
  }

}