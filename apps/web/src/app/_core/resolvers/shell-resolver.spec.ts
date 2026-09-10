import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { shellResolver } from './shell-resolver';

describe('shellResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => shellResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
