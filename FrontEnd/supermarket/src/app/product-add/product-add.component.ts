import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {
  products: Product[] = [];
  product: Product = {
    id: 0, 
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: '',
    minimum_stock: 0
  };
  filters = {
  name: '',
  category: '',
  stock: null as number | null,
  status: ''
};
  showProductForm = false;
  successMessage: string = '';   // ✅ added for alerts

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
    });
  }

  saveProduct() {
    if (this.product.id) {
      this.productService.updateProduct(this.product.id, this.product).subscribe({
        next: () => {
          this.getProducts();
          this.resetForm();
          this.toggleAddProduct();
          this.showMessage('✅ Product updated successfully!');
        },
       
        error: (error) => {
        console.error('Error Response:', error);
        const msg = error.error?.message || '❌ Failed to add product!';
        alert(msg); 
      }
      });
    } else {
      this.productService.addProduct(this.product).subscribe({
        next: () => {
          this.getProducts();
          this.resetForm();
          this.toggleAddProduct();
          this.showMessage('✅ Product added successfully!');
        },
         error: (error) => {
        console.error('Error Response:', error);
        const msg = error.error?.message || '❌ Failed to add product!';
        alert(msg); 
      }
      });
    }
  }

  editProduct(id: number, product: Product) {
    this.product = { ...product };
    this.toggleAddProduct();
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.getProducts();
        this.showMessage('🗑️ Product deleted successfully!');
      },
       error: (error) => {
        console.error('Error Response:', error);
        const msg = error.error?.message || '❌ Failed to delete product!';
        alert(msg); 
      }
    });
  }

  resetForm() {
    this.product = {
      id: 0,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      category: '',
      minimum_stock: 0
    };
  }

  calculateLowStock(): number {
    return this.products.filter(p => p.stock < p.minimum_stock && p.stock > 0).length;
  }

  calculateTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  getStatusClass(product: Product): string {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock < product.minimum_stock) return 'low-stock';
    return 'in-stock';
  }

  getStatusText(product: Product): string {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock < product.minimum_stock) return 'Low Stock';
    return 'In Stock';
  }

  toggleAddProduct(isNew: boolean = false) {
    this.showProductForm = !this.showProductForm;
    if (isNew) {
      this.resetForm();
    }
  }

  // ✅ helper for success and error popup messages
  private showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  get filteredProducts(): Product[] {
  return this.products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(this.filters.name.toLowerCase());
    const matchesCategory = this.filters.category ? p.category === this.filters.category : true;
    const matchesStock = this.filters.stock !== null ? p.stock >= this.filters.stock : true;
    const productStatus = p.stock === 0 ? 'out-of-stock' :
                          p.stock < p.minimum_stock ? 'low-stock' : 'in-stock';
    const matchesStatus = this.filters.status ? productStatus === this.filters.status : true;
    return matchesName && matchesCategory && matchesStock && matchesStatus;
  });
}
}