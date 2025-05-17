import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanteenService } from '../../services/canteen.service';
import { CanteenSubscription } from '../../models/canteen-subscription.model';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import FormsModule and ReactiveFormsModule in the module

@Component({
  selector: 'app-canteen-subscription',
  templateUrl: './canteen-subscription.component.html',
  styleUrls: ['./canteen-subscription.component.css']
})
export class CanteenSubscriptionComponent implements OnInit {
  subscriptions$!: Observable<CanteenSubscription[]>;
  childId!: string;
  showForm = false;
  subscriptionForm!: FormGroup;
  editingSubscription: CanteenSubscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private canteenService: CanteenService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.childId = params.get('childId')!;
      this.loadSubscriptions();
    });

    this.subscriptionForm = this.fb.group({
      startDate: ['', Validators.required],
      type: ['full_week', Validators.required],
      specificDays: [[]] // Géré dynamiquement
    });

    this.subscriptionForm.get('type')?.valueChanges.subscribe(value => {
      const specificDaysControl = this.subscriptionForm.get('specificDays');
      if (value === 'specific_days') {
        specificDaysControl?.setValidators(Validators.required);
      } else {
        specificDaysControl?.clearValidators();
      }
      specificDaysControl?.updateValueAndValidity();
    });
  }

  loadSubscriptions(): void {
    this.subscriptions$ = this.canteenService.getSubscriptionsForChild(this.childId);
  }

  toggleSubscriptionForm(subscription?: CanteenSubscription): void {
    this.showForm = !this.showForm;
    if (subscription) {
      this.editingSubscription = subscription;
      this.subscriptionForm.patchValue({
        startDate: this.formatDate(subscription.startDate), // Pour input type=date
        type: subscription.type,
        specificDays: subscription.specificDays || []
      });
    } else {
      this.editingSubscription = null;
      this.subscriptionForm.reset({ type: 'full_week', specificDays: [] });
    }
  }

  onSubmit(): void {
    if (this.subscriptionForm.invalid) {
      return;
    }

    const formValue = this.subscriptionForm.value;
    const subscriptionData: Omit<CanteenSubscription, 'id' | 'childId' | 'createdAt' | 'isActive' | 'updatedAt'> & { childId: string } = {
      childId: this.childId,
      startDate: new Date(formValue.startDate),
      endDate: null, // Gérer la endDate si nécessaire
      type: formValue.type,
      specificDays: formValue.type === 'specific_days' ? formValue.specificDays : undefined,
    };

    if (this.editingSubscription) {
      const updatedSub: CanteenSubscription = {
        ...this.editingSubscription,
        ...subscriptionData,
        startDate: new Date(formValue.startDate), // Assurer que la date est bien un objet Date
      };
      this.canteenService.updateSubscription(updatedSub).subscribe(() => {
        this.loadSubscriptions();
        this.toggleSubscriptionForm();
      });
    } else {
      this.canteenService.addSubscription(subscriptionData).subscribe(() => {
        this.loadSubscriptions();
        this.toggleSubscriptionForm();
      });
    }
  }

  cancelSubscription(subscriptionId: string): void {
    if (confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) {
      this.canteenService.cancelSubscription(subscriptionId).subscribe(() => {
        this.loadSubscriptions();
      });
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  getWeekDays(): string[] {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }

  onDayCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const day = checkbox.value;
    let currentDays = this.subscriptionForm.get('specificDays')?.value || [];
    if (checkbox.checked) {
      currentDays.push(day);
    } else {
      currentDays = currentDays.filter((d: string) => d !== day);
    }
    this.subscriptionForm.get('specificDays')?.setValue(currentDays);
  }

  isDaySelected(day: string): boolean {
    return this.subscriptionForm.get('specificDays')?.value?.includes(day);
  }
}
