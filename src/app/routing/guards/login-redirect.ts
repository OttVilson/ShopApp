import { Params, Router, RouterStateSnapshot, UrlTree } from "@angular/router";

export function composeLoginRedirect(state: RouterStateSnapshot, router: Router): UrlTree {
    let urlTree: UrlTree = router.parseUrl(state.url);

    let params: Params = {...urlTree.queryParams};
    if (urlTree.fragment)
      params['fragment'] = urlTree.fragment;
    includeRedirectUrlToParams(params, urlTree);  

    urlTree = router.parseUrl('/login');
    urlTree.queryParams = params;

    return urlTree;
}

function includeRedirectUrlToParams(params: Params, urlTree: UrlTree): void {
    urlTree.queryParams = {};
    urlTree.fragment = null;
    params['redirectUrl'] = urlTree.toString();
}