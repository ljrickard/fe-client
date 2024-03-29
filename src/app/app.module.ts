import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpModule } from '@angular/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { CarouselModule } from 'ngx-bootstrap/carousel';

import { AppComponent } from './app.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { MainComponent } from './components/main/main.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { LogoutComponent } from './components/logout/logout.component';

import { EsService } from './services/es.service';
import { ProductSummaryComponent } from './components/product-summary/product-summary.component';
import { ProductAbbreviatedComponent } from './components/product-abbreviated/product-abbreviated.component';

const appRoutes: Routes = [
  {path:'', component:MainComponent},
  {path:'login', component:LoginComponent},
  {path:'logout', component:LogoutComponent},
  {path:'profile', component:UserProfileComponent},
  {path:':skincare/:id', component:ProductDetailsComponent},
  {path:'**', component:PageNotFoundComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    ProductDetailsComponent,
    NavbarComponent,
    FooterComponent,
    SearchResultsComponent,
    ProductFilterComponent,
    LoginComponent,
    PageNotFoundComponent,
    SearchBoxComponent,
    MainComponent,
    UserProfileComponent,
    LogoutComponent,
    ProductSummaryComponent,
    ProductAbbreviatedComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    AngularFontAwesomeModule,
    HttpModule, 
    InfiniteScrollModule,
    Ng4LoadingSpinnerModule.forRoot(),
    CarouselModule.forRoot(),
  ],
  providers: [
    EsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
