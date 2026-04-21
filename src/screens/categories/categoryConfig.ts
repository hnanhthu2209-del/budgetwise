// Quick-add sub-types per category — mirrors PRD §5.2 bullet lists.
import { CategoryId } from '../../domain/budget';

export const CATEGORY_SUBTYPES: Record<CategoryId, string[]> = {
  entertainment: ['Hanging out', 'Subscription', 'Event', 'Other'],
  food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Coffee', 'Delivery'],
  transportation: ['Ride-hailing', 'Fuel', 'Public transit', 'Parking'],
  shopping: ['Clothing', 'Electronics', 'Household', 'Beauty', 'Flash sale'],
  bills: ['Electricity', 'Water', 'Internet', 'Rent', 'Credit card', 'Phone'],
  tax: ['Personal income tax', 'VAT', 'Social insurance', 'Other'],
};
