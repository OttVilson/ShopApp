import { Directive, ElementRef, Input } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: '[shortcut-nav]'
})
export class ShortcutNavDirective {

  @Input('shortcut-nav') menuTrigger?: MatMenuTrigger;

  constructor(private el: ElementRef) {
    const element = this.el.nativeElement as HTMLElement;
    element.style.zIndex = '1001';
    element.addEventListener('click', () => {
      this.menuTrigger?.closeMenu();
    });
  }
}
