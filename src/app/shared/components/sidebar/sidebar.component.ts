import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.enum';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  id: string;
  roles: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  navItems: NavItem[] = [
    {
      label: 'Dashboard', id: 'dashboard', route: '/dashboard',
      icon: 'M3 3h7v9H3zm0 11h7v7H3zm11-11h7v7h-7zm0 9h7v9h-7z',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    },
    {
      label: 'Users', id: 'users', route: '/users',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      roles: [Role.ADMINISTRATOR]
    },
    {
      label: 'Citizens', id: 'citizens', route: '/citizens',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    },
    {
      label: 'Programs', id: 'programs', route: '/programs',
      icon: 'M2 3h20v14H2zM8 21h8M12 17v4',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    },
    {
      label: 'Schemes', id: 'schemes', route: '/schemes',
      icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 7h6m-6 4h4',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    },
    {
      label: 'Applications', id: 'applications', route: '/applications',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    },
    {
      label: 'Disbursements', id: 'disbursements', route: '/disbursements',
      icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6',
      roles: [Role.WELFARE_OFFICER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER]
    },
    {
      label: 'Payments', id: 'payments', route: '/payments',
      icon: 'M2 5h20v14H2zM2 10h20',
      roles: [Role.WELFARE_OFFICER, Role.ADMINISTRATOR]
    },
    {
      label: 'Compliance', id: 'compliance', route: '/compliance',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      roles: [Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR, Role.ADMINISTRATOR]
    },
    {
      label: 'Notifications', id: 'notifications', route: '/notifications',
      icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
      roles: [Role.CITIZEN, Role.WELFARE_OFFICER, Role.ADMINISTRATOR]
    },
    {
      label: 'Reports', id: 'reports', route: '/reports',
      icon: 'M18 20V10M12 20V4M6 20v-6',
      roles: [Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR]
    }
  ];

  get filteredNavItems(): NavItem[] {
    const role = this.authService.getUserRole();
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  }
}
