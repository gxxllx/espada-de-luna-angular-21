import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryService } from '@/app/core/services/category.service';
import { ProductService } from '@/app/core/services/product.service';

import { NewProduct } from './new-product';

describe('NewProduct', () => {
  let component: NewProduct;
  let fixture: ComponentFixture<NewProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProduct],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getAll: () => of({ data: [] }),
          },
        },
        {
          provide: ProductService,
          useValue: {
            createProduct: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
