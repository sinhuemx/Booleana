import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-react-mfe-wrapper',
  standalone: true,
  template: '<div #reactMfeContainer></div>',
  styleUrls: ['./react-mfe-wrapper.component.scss']
})
export class ReactMfeWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('reactMfeContainer', { static: true }) reactMfeContainer!: ElementRef;

  private loginSuccessHandler: (event: Event) => void;

  constructor(private router: Router) {
    this.loginSuccessHandler = this.handleLoginSuccess.bind(this);
  }

  async ngOnInit(): Promise<void> {
    // Escucha el evento personalizado que emite React
    this.reactMfeContainer.nativeElement.addEventListener('mfeLoginSuccess', this.loginSuccessHandler);

    try {
    const loginModule = await loadRemoteModule({
  type: 'script',
  remoteEntry: 'http://localhost:4201/remoteEntry.js',
  remoteName: 'mfeReact', // agregado
  exposedModule: './Login'
});


      const mount = loginModule.mount;
      if (mount) {
        mount(this.reactMfeContainer.nativeElement);
      } else {
        console.error('Mount function not found in remote module.');
      }
    } catch (error) {
      console.error('Error loading React MFE:', error);
    }
  }

  ngOnDestroy(): void {
    this.reactMfeContainer.nativeElement.removeEventListener('mfeLoginSuccess', this.loginSuccessHandler);
  }

  private handleLoginSuccess(event: Event): void {
    const customEvent = event as CustomEvent;
    console.log('Login success event received from MFE:', customEvent.detail);
    this.router.navigate(['/interview']);
  }
}
