import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, pipe, ReplaySubject } from 'rxjs';
import { catchError, delay, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import * as firebase from 'firebase/compat/app';
import { AppUser, areUsersEqual, LoginProvider } from '../model/model';
import { SpinnerService } from './spinner.service';

export const ANONYMOUS: AppUser = {
  uuid: '',
  name: 'Anonymous',
  photoURL: undefined,
  icon: 'person_off',
  loginProvider: LoginProvider.GOOGLE
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user$: ReplaySubject<AppUser> = new ReplaySubject<AppUser>(1);

  constructor(private afAuth: AngularFireAuth, spinner: SpinnerService) {
    this.initializeUser();
    spinner.serviceInitializationSpinner(this._user$);
  }
  
  private initializeUser(): void {
    this.afAuth.user.pipe<firebase.default.User | null, firebase.default.auth.IdTokenResult | undefined, AppUser, AppUser> (
      catchError(error => of(null)),
      switchMap(user => user?.getIdTokenResult() || of(undefined)),
      map(tokenResult => tokenResult ? this.extractUser(tokenResult) : ANONYMOUS),
      distinctUntilChanged(areUsersEqual)
    ).subscribe(user => this._user$.next(user));
  }
  
  get user$() {
    return this._user$.asObservable();
  }

  login(loginProvider: LoginProvider): void {
    let provider: any = null;
    switch(loginProvider) {
      case LoginProvider.GOOGLE:
        provider = new firebase.default.auth.GoogleAuthProvider();
        break;

      case LoginProvider.GITHUB:
        provider = new firebase.default.auth.GithubAuthProvider();
        break;

      default:
        throw new Error('Unknown login provider');
    }
        
    this.afAuth.signInWithRedirect(provider);
  }

  getRedirectResult(): Promise<void> {
    return this.afAuth.getRedirectResult().then(
      () => Promise.resolve()
    );
  }

  private extractUser(tokenResult: firebase.default.auth.IdTokenResult): AppUser {
    const claims = tokenResult.claims;
    let user = {
      uuid: claims.user_id as string,
      name: claims.name as string,
      photoURL: claims.picture as string,
      isAdmin: !!claims.admin,
      loginProvider: this.getLoginProviderFromId(claims.firebase!.sign_in_provider!)
    }
    return user;
  }

  private getLoginProviderFromId(loginProvider: string): LoginProvider {
    let provider: LoginProvider = LoginProvider.GOOGLE;
    switch (loginProvider) {
      case 'google.com':
        provider = LoginProvider.GOOGLE;
        break;

      case 'github.com':
        provider = LoginProvider.GITHUB;
        break;

      default:
        throw new Error(`Unknown provider: ${loginProvider}`);
    }
    return provider;
  }
}