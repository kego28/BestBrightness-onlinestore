import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCustemerOrdersPage } from './admin-custemer-orders.page';

describe('AdminCustemerOrdersPage', () => {
  let component: AdminCustemerOrdersPage;
  let fixture: ComponentFixture<AdminCustemerOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCustemerOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
