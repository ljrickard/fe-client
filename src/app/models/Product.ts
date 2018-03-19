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

  constructor(id:string, name:string, 
                primaryImage:string, tagline:string,
                gender:string[], ingredients:string[],
                description:string, tags:string[],
                images:string[], score:number, 
                skinType:string){

    this.id = id;
    this.name = name;
    this.primaryImage = primaryImage;
    this.tagline = tagline;
    this.gender = gender;
    this.ingredients = ingredients;
    this.description = description;
    this.tags = tags;
    this.images = images;
    this.score = score;
    this.skinType = skinType;
  }

}