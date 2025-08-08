import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'app-react-mfe-wrapper',
  standalone: true,
  template: '<div #reactMfeContainer></div>',
  styleUrls: ['./react-mfe-wrapper.component.scss']
})
export class ReactMfeWrapperComponent implements OnInit {
  @ViewChild('reactMfeContainer', { static: true }) reactMfeContainer!: ElementRef;

  constructor() { }

  async ngOnInit(): Promise<void> {
    try {
      const { mount } = await loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Login'
      });

      if (mount) {
        mount(this.reactMfeContainer.nativeElement);
      } else {
        console.error('Mount function not found in remote module.');
      }
    } catch (error) {
      console.error('Error loading React MFE:', error);
    }
  }
}
