import { expect } from 'chai';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService } from './product.service';

describe('ProductService (Mocha + Chai)', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  // 👉 Direct hardcoded base URL
  const baseUrl = 'http://localhost:31825/api/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // make sure no pending HTTP calls
  });

  it('should be created', () => {
    expect(service).to.exist;
  });

  it('should fetch products', (done) => {
    const mockProducts = [
      { id: 1, name: 'Apple', price: 100 },
      { id: 2, name: 'Banana', price: 200 }
    ];

    service.getProducts().subscribe((data) => {
      expect(data).to.deep.equal(mockProducts);
      done();
    });

    // Intercept the outgoing request
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).to.equal('GET');
    // Respond with mock data
    req.flush(mockProducts);
  });

  it('should add a new product', (done) => {
    const newProduct = { id: 3, name: 'Mango', price: 300 };

    service.addProduct(newProduct).subscribe((data) => {
      expect(data).to.deep.equal(newProduct);
      done();
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).to.equal('POST');
    expect(req.request.body).to.deep.equal(newProduct);
    req.flush(newProduct);
  });
});