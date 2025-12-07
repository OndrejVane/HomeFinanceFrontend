import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  grafanaUrl = environment.grafanaUrl;

  logout() {
    this.authService.logout();
  }
/**
 *
 */
constructor(private authService: AuthService) {}

}
