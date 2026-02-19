import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-layout',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout {}
