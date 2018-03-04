import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatUrl'})
export class FormatUrlPipe implements PipeTransform {
  transform(unformattedUrl: string): string {
    let skincareIndexEnd = 10;
    let skincare = unformattedUrl.substring(0, skincareIndexEnd);
    let brandAndProduct = unformattedUrl.substring(skincareIndexEnd);
    let doubleAmperSandIndex = brandAndProduct.indexOf('&&');
    let brand = brandAndProduct.substring(0, doubleAmperSandIndex);
    let product = brandAndProduct.substring(doubleAmperSandIndex+2);
    let re = / /gi;
    return unformattedUrl.replace(re, "-")
    // return skincare + brand.replace(re, "-") + "-" + product.replace(re, "-");
  }
}