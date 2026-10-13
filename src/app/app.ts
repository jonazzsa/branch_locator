import { Header } from './components/header/header';
import { Component } from '@angular/core';
import { BranchLocator } from './components/branch-locator/branch-locator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, BranchLocator],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {





  
}
