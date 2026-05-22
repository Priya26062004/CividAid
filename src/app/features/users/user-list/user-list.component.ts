import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/user.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users: UserResponse[] = [];
  loading = true;

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => this.loading = false
    });
  }

  viewUser(id: number): void { this.router.navigate(['/users', id]); }

  deleteUser(id: number): void {
    if (confirm('Delete this user? This cannot be undone.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: err => alert(err.error || 'Failed to delete user')
      });
    }
  }
}
