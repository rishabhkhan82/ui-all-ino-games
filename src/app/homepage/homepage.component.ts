import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) {}
}
