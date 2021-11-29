import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginProvider } from '../model/model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private auth: AuthService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  loginUsingGoogle() {
    this.auth.login(LoginProvider.GOOGLE);
  }

  loginUsingGithub() {
    this.auth.login(LoginProvider.GITHUB);
  }

  ngOnInit() {
    this.auth.getRedirectResult().then(
      () => {
        let {redirectUrl, fragment, ...queryParams} = this.route.snapshot.queryParams;
        if (redirectUrl == null)
          return;
        
        let urlTree: UrlTree = this.composeUrlTree(redirectUrl, queryParams, fragment);
        this.router.navigateByUrl(urlTree);
      }
    );
  }

  composeUrlTree(redirectUrl: string, queryParams: Params, fragment: string): UrlTree {
    let urlTree: UrlTree = this.router.parseUrl(redirectUrl);
    urlTree.queryParams = queryParams;
    urlTree.fragment = fragment;
    return urlTree;
  }
}
