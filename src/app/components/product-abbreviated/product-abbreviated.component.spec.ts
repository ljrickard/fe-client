import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAbbreviatedComponent } from './product-abbreviated.component';

describe('ProductAbbreviatedComponent', () => {
  let component: ProductAbbreviatedComponent;
  let fixture: ComponentFixture<ProductAbbreviatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductAbbreviatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAbbreviatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
