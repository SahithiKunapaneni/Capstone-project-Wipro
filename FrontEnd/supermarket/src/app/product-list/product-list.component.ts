import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  editIndex: number | null = null;
  searchText: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  editProduct(index: number) {
    this.editIndex = index;
  }

  updateProduct(product: any) {
    this.productService.updateProduct(product.id, product).subscribe(
      response => {
        alert('Product updated successfully');
        this.editIndex = null;
        this.getProducts();
      },
      error => {
        const errorMessage = error.error && error.error.message ? error.error.message : 'Failed to update product';
        alert(errorMessage);
      }
    );
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(response => {
      alert('Product deleted successfully');
      this.getProducts();
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}