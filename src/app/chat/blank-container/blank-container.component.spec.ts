import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankContainerComponent } from './blank-container.component';

describe('BlankContainerComponent', () => {
  let component: BlankContainerComponent;
  let fixture: ComponentFixture<BlankContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlankContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlankContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
