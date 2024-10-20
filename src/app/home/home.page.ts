import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isScrolled = false;
  // isScrolled = false;
  isMenuOpen = false;
  constructor(
    private menu: MenuController,
    private router: Router
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 20;
  }

  openMenu() {
    this.menu.open();
  }
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  Signup() {
    this.router.navigate(['/signup']);
  }

  browseProducts() {
    this.router.navigate(['/products']);
  }

  viewPromotions() {
    this.router.navigate(['/promotions']);
  }

  viewAccount() {
    this.router.navigate(['/account']);
  }

  ngOnInit() {
    // Initial check for scroll position
    this.onWindowScroll();
  }

  ngOnDestroy() {
    // No need to remove listener as @HostListener handles cleanup
  }
}