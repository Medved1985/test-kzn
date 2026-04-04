import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ApiService, Client } from '../services/api.service';
import { PushService } from '../services/push.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule],
})
export class ClientsComponent implements OnInit {
  clients = signal<Client[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);
  selectedClients = signal<Set<number>>(new Set());

  // Пагинация
  currentPage = signal(0); // 0-based для mat-paginator
  pageSize = signal(25);
  pageSizeOptions = [10, 25, 50, 100];

  // Поиск
  searchControl = new FormControl('');
  searchField = signal('fio');
  searchFields = [
    { value: 'fio', label: 'ФИО' },
    { value: 'phone', label: 'Телефон' },
    { value: 'barcode', label: 'Штрихкод' },
    { value: 'email', label: 'Email' },
    { value: 'user_id', label: 'ID пользователя' },
    { value: 'car_number', label: 'Номер автомобиля' }
  ];

  // Сортировка
  sortField = signal('user_id');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Отображаемые колонки
  displayedColumns: string[] = [
    'select',
    'user_id',
    'telegram',
    'o_s',
    'maket',
    'fio',
    'name',
    'phone',
    'barcode',
    'bonus',
    'summ',
    'loyalty_level',
    'link',
    'created_at',
  ];

  // Computed значения
  hasSelected = computed(() => this.selectedClients().size > 0);
  selectedCount = computed(() => this.selectedClients().size);

  private searchValue = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    )
  );

  constructor(
    private apiService: ApiService,
    public pushService: PushService,
    private snackBar: MatSnackBar
  ) {
    effect(() => {
      this.loadClients();
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);

    const params = {
      page: this.currentPage() + 1, // API ожидает 1-based page
      limit: this.pageSize(),
      search: this.searchValue() || '',
      searchField: this.searchField(),
      sortField: this.sortField(),
      sortDirection: this.sortDirection()
    };

    this.apiService.getClients(params).subscribe({
      next: (response) => {
        //@ts-ignore
        console.log('Loaded clients:', response);
        //@ts-ignore
        this.clients.set(response.passes);
        //@ts-ignore
        this.totalCount.set(response.meta.size);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Ошибка загрузки клиентов: ' + (error.error?.message || error.message), 'Закрыть', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  toggleSelect(clientId: number): void {
    const newSet = new Set(this.selectedClients());
    if (newSet.has(clientId)) {
      newSet.delete(clientId);
    } else {
      newSet.add(clientId);
    }
    this.selectedClients.set(newSet);
  }

  toggleSelectAll(): void {
    if (this.selectedClients().size === this.clients()?.length) {
      this.selectedClients.set(new Set());
    } else {
      const newSet = new Set(this.clients().map(c => c.user_id));
      this.selectedClients.set(newSet);
    }
  }

  isAllSelected(): boolean {
    return this.clients().length > 0 &&
      this.selectedClients().size === this.clients().length;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    if (event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
      this.currentPage.set(0);
    }
  }

  onSearchFieldChange(field: string): void {
    this.searchField.set(field);
  }

  onSortChange(sort: Sort): void {
    if (sort.direction) {
      this.sortField.set(sort.active);
      this.sortDirection.set(sort.direction);
    }
  }

  showLink(link: string): void {
    if (!link) return;

    // window.open('http://localhost:4200/' + link, '_blank');
  }

  formatDate(date: string | null): string {
    if (!date) return '—';

    const dateObj = new Date(date);

    // Проверяем, что дата валидная
    if (isNaN(dateObj.getTime())) return '—';

    // Форматируем время (часы и минуты)
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    // Форматируем дату (день, месяц, год)
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${hours}:${minutes} ${day}.${month}.${year}`;
  }

  formatPhone(phone: string): string {
    if (!phone) return '—';
    // Очищаем от всех нецифровых символов
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    if (cleaned.length === 10) {
      return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
    }
    return phone;
  }

  getLoyaltyLevelClass(level: string | null): string {
    if (!level) return '';
    switch (level.toLowerCase()) {
      case 'gold': return 'loyalty-gold';
      case 'silver': return 'loyalty-silver';
      case 'bronze': return 'loyalty-bronze';
      default: return '';
    }
  }

  getLoyaltyLevelIcon(level: string | null): string {
    if (!level) return 'stars';
    switch (level.toLowerCase()) {
      case 'gold': return 'workspace_premium';
      case 'silver': return 'military_tech';
      case 'bronze': return 'emoji_events';
      default: return 'stars';
    }
  }

  openPushModal(): void {
    const selectedClientIds = Array.from(this.selectedClients());
    const selectedClientNames = this.clients()
      .filter(client => selectedClientIds.includes(client.user_id))
      .map(client => ({ id: client.user_id.toString(), name: client.fio }));

    this.pushService.openPushModal(selectedClientNames).subscribe(result => {
      if (result) {
        this.sendPush(result);
      }
    });
  }

  sendPush(data: { clientIds: string[]; message: string; scheduledDate?: Date }): void {
    this.pushService.setLoading(true);

    this.apiService.sendPush(data).subscribe({
      next: () => {
        this.snackBar.open(
          data.scheduledDate
            ? `PUSH-сообщение запланировано на ${data.scheduledDate.toLocaleString()}`
            : 'PUSH-сообщение отправлено успешно',
          'Закрыть',
          { duration: 3000 }
        );
        this.selectedClients.set(new Set());
        this.pushService.setLoading(false);
      },
      error: (error) => {
        console.error('Error sending push:', error);
        this.snackBar.open('Ошибка отправки PUSH-сообщения', 'Закрыть', { duration: 3000 });
        this.pushService.setLoading(false);
      }
    });
  }
}