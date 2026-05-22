import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CitizenService } from '../../../core/services/citizen.service';
import { Role } from '../../../core/models/role.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder); //means that we are using the FormBuilder service to create our login form. The FormBuilder is a convenient way to create forms in Angular. It provides methods to create form controls and form groups, and it also allows us to easily add validators to our form controls.
  private authService = inject(AuthService); //means that we are using the AuthService to handle the login logic. The AuthService is a service that we created to handle authentication in our application. It has a login method that takes the user's email and password and sends a request to the backend to authenticate the user. If the authentication is successful, it stores the user's information in local storage and returns an observable with the user's data.
  private userService = inject(UserService); //means that we are using the UserService to fetch the user's information after a successful login. The UserService is a service that we created to handle user-related operations in our application. It has a getAllUsers method that fetches all users from the backend. We use this method to find the logged-in user's ID based on their email, which is necessary for further operations, especially for citizens who need to access their profile.
  private citizenService = inject(CitizenService); //means that we are using the CitizenService to fetch the citizen's information after a successful login. The CitizenService is a service that we created to handle citizen-related operations in our application. It has a getCitizenByUserId method that fetches a citizen's information based on their user ID. We use this method to find the logged-in citizen's ID, which is necessary for redirecting them to their profile page and allowing them to manage their applications.
  private router = inject(Router);//means that we are using the Router service to navigate the user to different pages after a successful login. The Router is a service provided by Angular that allows us to programmatically navigate to different routes in our application. We use it to redirect users to the dashboard or their profile page based on their role after they log in successfully.

  loginForm: FormGroup = this.fb.group({ //what we are writing in form groups 
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMsg = '';

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void { //means that when the user submits the login form, we first check if the form is valid. If it is not valid, we mark all fields as touched to trigger validation messages and return early. If the form is valid, we set the loading state to true and clear any previous error messages. We then call the login method of the AuthService with the form values (email and password). If the login is successful, we check if the response includes a userId and store it in the AuthService. We then call a method to resolve the user's ID and role to determine where to redirect them (dashboard for officers or profile page for citizens). If there is an error during login, we display an appropriate error message and set loading to false.
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
  
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Save userId if backend returns it directly.
        if ('userId' in response && response.userId) {
          this.authService.setUserId(response.userId);
          console.log('Login response included userId:', response.userId);
        }
        const cleanRole = response.role.replace('ROLE_', '');
        if (cleanRole === Role.CITIZEN && response.userId) {
          this.ensureCitizenProfile(response.userId, undefined, undefined, response.email);
          return;
        }

        this.resolveUserId(response.email, response.role);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || err.error || 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }

  private resolveUserId(email: string, role: string): void {
    console.log('Resolving userId for email:', email, 'role:', role);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users fetched:', users);
        const match = users.find(u => u.email === email);
        if (match) {
          console.log('User matched:', match);
          this.authService.setUserId(match.userId); 
          console.log('UserId stored:', match.userId);

          // If CITIZEN, redirect to profile edit page
          const cleanRole = role.replace('ROLE_', '');
          console.log('Clean role:', cleanRole); 
          if (cleanRole === Role.CITIZEN) {
            this.ensureCitizenProfile(match.userId, match.name, match.phone, match.email);
            return;
          }
        }
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: () => {
        const cleanRole = role.replace('ROLE_', '');
        if (cleanRole === Role.CITIZEN) {
          this.router.navigate(['/citizens']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.loading = false;
      }
    });
  }

  private ensureCitizenProfile(userId: number, name?: string, phone?: string, email?: string): void {
    this.citizenService.getCitizenByUserId(userId).subscribe({
      next: (citizen) => {
        this.authService.setCitizenId(citizen.citizenId);
        this.router.navigate(['/citizens']);
        this.loading = false;
      },
      error: () => {
        const fallbackName = name ?? (email ? email.split('@')[0] : 'Citizen');
        if (name || phone || email) {
          const createRequest = {
            name: fallbackName,
            contactInfo: phone,
            userId
          };
          this.citizenService.createCitizen(createRequest).subscribe({
            next: (created) => {
              this.authService.setCitizenId(created.citizenId);
              this.router.navigate(['/citizens']);
              this.loading = false;
            },
            error: () => {
              this.router.navigate(['/citizens']);
              this.loading = false;
            }
          });
          return;
        }

        this.userService.getUserById(userId).subscribe({
          next: (user) => {
            const createRequest = {
              name: user.name,
              contactInfo: user.phone,
              userId
            };
            this.citizenService.createCitizen(createRequest).subscribe({
              next: (created) => {
                this.authService.setCitizenId(created.citizenId);
                this.router.navigate(['/citizens']);
                this.loading = false;
              },
              error: () => {
                this.router.navigate(['/citizens']);
                this.loading = false;
              }
            });
          },
          error: () => {
            this.router.navigate(['/citizens']);
            this.loading = false;
          }
        });
      }
    });
  }
}
